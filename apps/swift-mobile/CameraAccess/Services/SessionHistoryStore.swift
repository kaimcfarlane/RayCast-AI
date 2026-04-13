import Foundation

struct SessionRecord: Identifiable, Codable {
    let id: String
    let taskMode: TaskMode
    let startDate: Date
    var messages: [RecordedMessage]

    var messageCount: Int { messages.count }

    var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: startDate, relativeTo: Date())
    }

    var duration: String {
        guard let first = messages.first, let last = messages.last else { return "–" }
        let seconds = Int(last.timestamp.timeIntervalSince(first.timestamp))
        if seconds < 60 { return "\(seconds)s" }
        return "\(seconds / 60)m \(seconds % 60)s"
    }
}

struct RecordedMessage: Identifiable, Codable {
    let id: String
    let text: String
    let timestamp: Date
    let isUser: Bool

    init(text: String, timestamp: Date, isUser: Bool) {
        self.id = UUID().uuidString
        self.text = text
        self.timestamp = timestamp
        self.isUser = isUser
    }
}

extension TaskMode: Codable {}

@MainActor
class SessionHistoryStore: ObservableObject {
    static let shared = SessionHistoryStore()

    @Published private(set) var sessions: [SessionRecord] = []

    private let storageKey = "raycast_session_history"
    private let maxSessions = 50

    private init() {
        load()
    }

    func startSession(id: String, taskMode: TaskMode) {
        let record = SessionRecord(
            id: id,
            taskMode: taskMode,
            startDate: Date(),
            messages: []
        )
        sessions.insert(record, at: 0)
        save()
    }

    func addMessage(sessionId: String, text: String, isUser: Bool) {
        guard let idx = sessions.firstIndex(where: { $0.id == sessionId }) else { return }
        let msg = RecordedMessage(text: text, timestamp: Date(), isUser: isUser)
        sessions[idx].messages.append(msg)
        save()
    }

    func deleteSession(id: String) {
        sessions.removeAll { $0.id == id }
        save()
    }

    func clearAll() {
        sessions.removeAll()
        save()
    }

    private func save() {
        if sessions.count > maxSessions {
            sessions = Array(sessions.prefix(maxSessions))
        }
        if let data = try? JSONEncoder().encode(sessions) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([SessionRecord].self, from: data) else {
            return
        }
        sessions = decoded
    }
}
