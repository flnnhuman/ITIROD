let register = {

    render: async () => {
        let view =  /*html*/`
            <div class="background">
    <div class="modal">
        <form>
            <div class="header__logo_image">
            </div>

            <div class="register__container">
                <label for="email"><b>Email</b></label>
                <input type="text" placeholder="Enter Email" id="email" required>

                <label for="password"><b>Password</b></label>
                <input type="password" placeholder="Enter Password" id="password" required>

                <label for="conf_password"><b>Confirm Password</b></label>
                <input type="password" placeholder="Confirm Password" id="conf_password" required>

                <button id="confirm-register" type="submit" class="hover-btn" style="color: black">Register</button>

            </div>
            <div class="register__footer"></div>

        </form>
    </div>
</div>
        `
        return view
    }
    , after_render: async () => {
        const confirm_register = document.getElementById("confirm-register");

        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const conf_password = document.getElementById("conf_password");


        confirm_register.addEventListener("click", () => {
            event.preventDefault();

            if (password.value === conf_password.value){
                firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
                    .then(async function (newUser) {
                        window.location.href = '/#/';
                    }).catch(function (error) {
                    alert(error.message);
                });
                return;
            }

            alert('password and confirm password are not equal')

        });
    }
}
export default register;
