import SwiftUI

@main
struct LARPApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .ignoresSafeArea()
                .statusBarHidden(true)
        }
    }
}
