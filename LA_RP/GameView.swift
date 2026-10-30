import SwiftUI
import WebKit

struct GameView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {

        let configuration = WKWebViewConfiguration()

        configuration.allowsInlineMediaPlayback = true

        let webView = WKWebView(
            frame: .zero,
            configuration: configuration
        )

        webView.scrollView.isScrollEnabled = false
        webView.isOpaque = false
        webView.backgroundColor = UIColor(
            red: 0.42,
            green: 0.68,
            blue: 0.82,
            alpha: 1
        )

        webView.scrollView.backgroundColor =
            webView.backgroundColor

        loadGame(in: webView)

        return webView
    }

    private func loadGame(in webView: WKWebView) {

        let bundle = Bundle.main

        let possibleLocations: [URL?] = [

            bundle.url(
                forResource: "index",
                withExtension: "html",
                subdirectory: "Web"
            ),

            bundle.url(
                forResource: "index",
                withExtension: "html"
            ),

            bundle.resourceURL?
                .appendingPathComponent("Web")
                .appendingPathComponent("index.html"),

            bundle.bundleURL
                .appendingPathComponent("Web")
                .appendingPathComponent("index.html")
        ]

        for location in possibleLocations {

            guard let url = location else {
                continue
            }

            guard FileManager.default.fileExists(
                atPath: url.path
            ) else {
                continue
            }

            let directory = url.deletingLastPathComponent()

            webView.loadFileURL(
                url,
                allowingReadAccessTo: directory
            )

            return
        }

        let diagnostic = """
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport"
        content="width=device-width, initial-scale=1">
        </head>

        <body style="
        background:#17212c;
        color:white;
        font-family:Arial;
        padding:25px;
        ">

        <h2>LA RP - Erro de arquivos</h2>

        <p>Não foi encontrado o arquivo Web/index.html.</p>

        <p>Verifique se a pasta Web foi incluída no projeto XcodeGen.</p>

        <p>Arquivos disponíveis no aplicativo:</p>

        <pre>\(bundle.resourceURL?.path ?? "Indisponível")</pre>

        </body>
        </html>
        """

        webView.loadHTMLString(
            diagnostic,
            baseURL: bundle.resourceURL
        )
    }

    func updateUIView(
        _ uiView: WKWebView,
        context: Context
    ) {}
}
