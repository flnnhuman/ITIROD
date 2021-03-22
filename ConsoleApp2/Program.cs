using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Management;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ConsoleApp2.Models;
using Newtonsoft.Json;

namespace ConsoleApp2
{
	class Program
	{
		private static string myId;
		private static string notMyId;
		private static Config config;
		static UdpClient sender;
		static UdpClient receiver;
		private static DateTime lastHeartBeat = DateTime.Now;
		private static bool isDisconnected = true;
		private static readonly byte[] heartbeat = {0xAB, 0x32, 0xD7};
		private static readonly byte[] history_request = {0x54, 0xE3, 0x42};
		private static List<Message> history = new List<Message>();
		private static List<Message> unsent = new List<Message>();

		static async Task Main()
		{
			config = JsonConvert.DeserializeObject<Config>(await File.ReadAllTextAsync("config.json"));
			myId = GetID();

			sender = new UdpClient();
			receiver = new UdpClient(config.LocalPort);
			TaskCreationOptions options = TaskCreationOptions.DenyChildAttach;
			options |= TaskCreationOptions.LongRunning | TaskCreationOptions.PreferFairness |
			           TaskCreationOptions.AttachedToParent;
			await Task.Factory.StartNew(HeartBeat, CancellationToken.None, options, TaskScheduler.Default)
				.ConfigureAwait(false);
			await Task.Factory.StartNew(ReceiveMessage, CancellationToken.None, options, TaskScheduler.Default)
				.ConfigureAwait(false);
			await Task.Factory.StartNew(SendMessage, CancellationToken.None, options, TaskScheduler.Default)
				.ConfigureAwait(false);
		}

		private static async void HeartBeat()
		{
			var package = heartbeat.Concat(Encoding.Unicode.GetBytes(myId)).ToArray();
			await sender.SendAsync(package, package.Length, config.RemoveHost, config.RemotePort);
			await sender.SendAsync(history_request, history_request.Length, config.RemoveHost, config.RemotePort);
			while (true)
			{
				package = heartbeat.Concat(Encoding.Unicode.GetBytes(myId)).ToArray();
				await sender.SendAsync(package, package.Length, config.RemoveHost, config.RemotePort);
				await Task.Delay(TimeSpan.FromMilliseconds(500));

				if (DateTime.Compare(lastHeartBeat, DateTime.Now.AddMilliseconds(-1500)) != -1) continue;
				if (!isDisconnected)
				{
					Console.WriteLine("Disconnected");
				}

				isDisconnected = true;
			}
		}

		private static async void SendMessage()
		{
			try
			{
				while (true)
				{
					string input = Console.ReadLine();
					if (isDisconnected)
					{
						Console.WriteLine("Your message is not delivered, it will be delivered on reconect");
						var unsentMessage = new Message
							{message = input, sender = myId, receiver = notMyId, timestamp = DateTime.UtcNow.Ticks};
						unsent.Add(unsentMessage);
						continue;
					}

					var message = new Message
						{message = input, sender = myId, receiver = notMyId, timestamp = DateTime.UtcNow.Ticks};

					byte[] data = Encoding.Unicode.GetBytes(JsonConvert.SerializeObject(message));


					await sender.SendAsync(data, data.Length, config.RemoveHost, config.RemotePort);
					history.Add(message);
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.Message);
			}
			finally
			{
				sender.Close();
			}
		}

		private static async void ReceiveMessage()
		{
			try
			{
				while (true)
				{
					var result = await receiver.ReceiveAsync();
					if (result.Buffer.Take(3).SequenceEqual(heartbeat))
					{
						lastHeartBeat = DateTime.Now;
						if (isDisconnected)
						{
							Console.WriteLine("Connected");
							var package = result.Buffer.ToList();
							package.RemoveRange(0, 3);

							notMyId = Encoding.Unicode.GetString(package.ToArray());
							foreach (var msg in unsent.Where(x=> x.receiver== notMyId).OrderBy(x =>x.timestamp ))
							{
								var newpackage = Encoding.Unicode.GetBytes(msg.message);
								await sender.SendAsync(newpackage, newpackage.Length, config.RemoveHost, config.RemotePort);
							}

							unsent.RemoveAll(x => x.receiver == notMyId);
						}

						isDisconnected = false;

						continue;
					}

					if (result.Buffer.Take(3).SequenceEqual(history_request))
					{
						var sender = new UdpClient();
						foreach (var m in history.Where(x => x.sender == notMyId || x.receiver == notMyId)
							.OrderBy(x => x.timestamp))
						{
							if (m.message == "history")
							{
								continue;
							}

							var package = Encoding.Unicode.GetBytes(JsonConvert.SerializeObject(m));
							await sender.SendAsync(package, package.Length, config.RemoveHost, config.RemotePort);
						}


						continue;
					}


					Message message = JsonConvert.DeserializeObject<Message>(Encoding.Unicode.GetString(result.Buffer));
					if (myId == message.sender)
					{
						Console.WriteLine(message.message);
					}
					else
					{
						Console.WriteLine("Him: {0}", message.message);
					}

					history.Add(message);
				}
			}
			finally
			{
				receiver.Close();
			}
		}

		private static string GetID()
		{
			var mbs = new ManagementObjectSearcher("Select ProcessorId From Win32_processor");
			ManagementObjectCollection mbsList = mbs.Get();

			foreach (var o in mbsList)
			{
				var mo = (ManagementObject) o;
				return mo["ProcessorId"].ToString();
			}

			throw new NotSupportedException();
		}
	}
}