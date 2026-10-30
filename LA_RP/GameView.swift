import SwiftUI
import WebKit
import UIKit

struct GameView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()

        configuration.allowsInlineMediaPlayback = true

        let webView = WKWebView(
            frame: .zero,
            configuration: configuration
        )

        webView.backgroundColor = .black
        webView.isOpaque = false

        webView.scrollView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        webView.scrollView.contentInset = .zero
        webView.scrollView.scrollIndicatorInsets = .zero

        webView.translatesAutoresizingMaskIntoConstraints = false

        loadGame(in: webView)

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
    }

    private func loadGame(in webView: WKWebView) {
        guard let webDirectory = Bundle.main.resourceURL?
            .appendingPathComponent("Web", isDirectory: true) else {
            showError(in: webView, message: "Pasta Web não encontrada.")
            return
        }

        let indexURL = webDirectory.appendingPathComponent("index.html")
        let modelURL = webDirectory
            .appendingPathComponent("models", isDirectory: true)
            .appendingPathComponent("player.glb")

        guard FileManager.default.fileExists(atPath: indexURL.path) else {
            showError(in: webView, message: "Web/index.html não encontrado.")
            return
        }

        guard FileManager.default.fileExists(atPath: modelURL.path) else {
            showError(in: webView, message: "Web/models/player.glb não encontrado.")
            return
        }

        webView.loadFileURL(
            indexURL,
            allowingReadAccessTo: webDirectory
        )
    }

    private func showError(in webView: WKWebView, message: String) {
        let html = """
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="background:#10151d;color:white;font-family:Arial;padding:30px">
        <h2>LA RP - Erro</h2>
        <p>\(message)</p>
        </body>
        </html>
        """

        webView.loadHTMLString(html, baseURL: nil)
    }
}
