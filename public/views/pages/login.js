
let Login = {
    render: async () => {
        let view =  /*html*/
            `    
            <div class="background">
                <div class="modal">
                    <<form action=""></form>>
                        <div class="header__logo_image">
                        </div>
                
                        <div class="login__container">
                            <label for="username"><b>Username</b></label>
                            <input type="text" placeholder="Enter Username" id="username" required>
                
                            <label for="password"><b>Password</b></label>
                            <input type="password" placeholder="Enter Password" id="password" required>
                
                            <button id="confirm-login" class="hover-btn" style="color: black">Login</button>
                            <label>
                                <input type="checkbox" checked="checked" name="remember"> Remember me
                            </label>
                            <p style="color: black">
                                Don't have an account yet? <a href="/#/register">Sign up</a>
                            </p>
                        </div>
                
                        <div class="login__footer"></div>
                    </form>
                </div>
            </div>
        `
        return view

    }
    , after_render: async () => {
        const confirm_login = document.getElementById("confirm-login");

        confirm_login.addEventListener ("click",  () => {
            event.preventDefault();
            const username = document.getElementById("username");
            const password = document.getElementById("password");

            const auth = firebase.auth();
            const promise = auth.signInWithEmailAndPassword(username.value, password.value);
            promise
                .then(function(regUser){
                    window.location.href = '/#/';
                })
                .catch(e => console.log(e.message));
        });

    }

}

export default Login;
