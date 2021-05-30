let Footer = {
    render: async () => {
        let view =  /*html*/`
            <footer>
                <nav class="footer__block">
                    <h2>Navigation</h2>
                    <ul>
                        <li><a>Create playlist</a></li>
            
                    </ul>
                </nav>
                <div class="footer__block">
                    <h2>Email:</h2>
                    <p><a href="mailto:gmail.com">peseckiy.vlad@gmail.com</a>
                </div>
            </footer>
        `
        return view
    },
    after_render: async () => {
    }

}

export default Footer;
