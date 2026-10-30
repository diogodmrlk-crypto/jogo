import SwiftUI
import WebKit

struct GameView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        let web = WKWebView(
            frame: .zero,
            configuration: config
        )

        web.scrollView.isScrollEnabled = false
        web.isOpaque = false

        web.backgroundColor = UIColor(
            red: 0.42,
            green: 0.68,
            blue: 0.82,
            alpha: 1
        )

        web.scrollView.backgroundColor = web.backgroundColor

        if let url = Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "Web"
        ) {
            web.loadFileURL(
                url,
                allowingReadAccessTo: url.deletingLastPathComponent()
            )
        } else {
            web.loadHTMLString(
                """
                <html>
                <body style="background:#18212c;color:white;font:20px sans-serif;padding:30px">
                Não foi possível carregar os arquivos do jogo.
                </body>
                </html>
                """,
                baseURL: nil
            )
        }

        return web
    }

    func updateUIView(
        _ uiView: WKWebView,
        context: Context
    ) {}
}
