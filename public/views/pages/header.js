let Header = {
    render: async () => {
        let view =  /*html*/`
            <header>
                <div class="header__left">
                    <span>
                            <a href="/" class="header__logo_image"></a>
                    </span>
                    <nav>
                        <a href="/#/create">
                            <div class="hover-btn">Create playlist</div>
                        </a>
                        <a href="/#/upload">
                            <div class="hover-btn">Upload track</div>
                        </a>
                    </nav>
                </div>
                <nav class="header__right">
                
                    <button id="logout_btn" class="hover-btn hidden" onclick="firebase.auth().signOut()">Logout</button>
                    <a id="login_btn" href="/#/login">
                        <div class="hover-btn">Login</div>
                    </a>
                </nav>
            </header>
        `
        return view
    },
    after_render: async () => {
        let login_btn = document.getElementById('login_btn');
        let logout_btn = document.getElementById('logout_btn');

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser){
                login_btn.classList.add('hidden');
                logout_btn.classList.remove('hidden');
            }else{
                logout_btn.classList.add('hidden');
                login_btn.classList.remove('hidden');
            }
        });
    }

}

export default Header;
