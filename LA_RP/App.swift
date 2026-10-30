import SwiftUI

@main
struct LARPApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .ignoresSafeArea(.all)
                .statusBarHidden(true)
        }
    }
}
