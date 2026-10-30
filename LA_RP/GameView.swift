import SwiftUI
import WebKit
import UIKit

struct GameView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {

        let configuration = WKWebViewConfiguration()

        configuration.allowsInlineMediaPlayback = true

        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true

        configuration.defaultWebpagePreferences = preferences

        let webView = WKWebView(
            frame: .zero,
            configuration: configuration
        )

        // =====================================
        // CONFIGURAÇÃO DE TELA
        // =====================================

        webView.isOpaque = false
        webView.backgroundColor = UIColor.black

        webView.scrollView.backgroundColor = UIColor.black

        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false

        webView.scrollView.contentInsetAdjustmentBehavior = .never

        webView.scrollView.contentInset = .zero
        webView.scrollView.scrollIndicatorInsets = .zero

        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0

        webView.allowsBackForwardNavigationGestures = false

        // =====================================
        // CARREGAR JOGO
        // =====================================

        loadGame(in: webView)

        return webView
    }

    // =========================================
    // LOCALIZAR ARQUIVOS DO JOGO
    // =========================================

    private func loadGame(in webView: WKWebView) {

        let bundle = Bundle.main

        let possibleLocations: [URL?] = [

            bundle.url(
                forResource: "index",
                withExtension: "html",
                subdirectory: "Web"
            ),

            bundle.resourceURL?
                .appendingPathComponent("Web")
                .appendingPathComponent("index.html"),

            bundle.bundleURL
                .appendingPathComponent("Web")
                .appendingPathComponent("index.html"),

            bundle.url(
                forResource: "index",
                withExtension: "html"
            )
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

            let webDirectory = url.deletingLastPathComponent()

            webView.loadFileURL(
                url,
                allowingReadAccessTo: webDirectory
            )

            print("LA RP: Jogo carregado")
            print("LA RP: \(url.path)")

            return
        }

        showError(in: webView)
    }

    // =========================================
    // TELA DE ERRO
    // =========================================

    private func showError(in webView: WKWebView) {

        let html = """
        <!DOCTYPE html>
        <html lang="pt-BR">

        <head>
            <meta charset="UTF-8">

            <meta name="viewport"
            content="width=device-width,
            initial-scale=1.0,
            maximum-scale=1.0,
            user-scalable=no,
            viewport-fit=cover">

            <style>

                * {
                    box-sizing: border-box;
                }

                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    background: #080b10;
                    color: white;
                    font-family: Arial, sans-serif;
                }

                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 25px;
                }

                .container {
                    max-width: 500px;
                }

                h1 {
                    color: #a855f7;
                    font-size: 28px;
                }

                p {
                    color: #cbd5e1;
                    line-height: 1.6;
                }

                code {
                    color: #4ade80;
                }

            </style>
        </head>

        <body>

            <div class="container">

                <h1>LA RP</h1>

                <h2>Erro ao carregar o jogo</h2>

                <p>
                    Não foi encontrado o arquivo
                    <code>Web/index.html</code>.
                </p>

                <p>
                    Confira se a pasta Web foi adicionada
                    corretamente ao projeto.
                </p>

            </div>

        </body>
        </html>
        """

        webView.loadHTMLString(
            html,
            baseURL: Bundle.main.resourceURL
        )
    }

    // =========================================
    // ATUALIZAÇÃO DA VIEW
    // =========================================

    func updateUIView(
        _ uiView: WKWebView,
        context: Context
    ) {
        // Não recarregar o jogo durante atualizações
        // da interface SwiftUI.
    }
}
