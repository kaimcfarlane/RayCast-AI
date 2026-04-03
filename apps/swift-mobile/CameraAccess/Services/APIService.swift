import Foundation
import UIKit

struct StreamAnalysisResponse: Codable {
    let sessionId: String
    let changed: Bool
    let scene: SceneDescriptionDTO?
    let analysisText: String?
    let audioBase64: String?
    let taskMode: String
    let timestamp: String

    enum CodingKeys: String, CodingKey {
        case sessionId = "session_id"
        case changed
        case scene
        case analysisText = "analysis_text"
        case audioBase64 = "audio_base64"
        case taskMode = "task_mode"
        case timestamp
    }
}

struct SceneDescriptionDTO: Codable {
    let sceneSummary: String
    let objects: [ObjectLabelDTO]
    let textInScene: [TextInSceneDTO]
    let keyDetails: [String]
    let uncertainties: [String]

    enum CodingKeys: String, CodingKey {
        case sceneSummary = "scene_summary"
        case objects
        case textInScene = "text_in_scene"
        case keyDetails = "key_details"
        case uncertainties
    }
}

struct ObjectLabelDTO: Codable {
    let label: String
    let count: Int
}

struct TextInSceneDTO: Codable {
    let text: String
    let confidence: Double
}

final class APIService {
    static let shared = APIService()

    private var baseURL: String

    private let session: URLSession
    private let jpegQuality: CGFloat = 0.7

    private init() {
        if let plistURL = Bundle.main.object(forInfoDictionaryKey: "BACKEND_URL") as? String,
           !plistURL.isEmpty {
            baseURL = plistURL.hasSuffix("/") ? String(plistURL.dropLast()) : plistURL
        } else {
            baseURL = "http://127.0.0.1:8000"
        }

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 60
        config.timeoutIntervalForResource = 120
        session = URLSession(configuration: config)
    }

    func setBaseURL(_ url: String) {
        baseURL = url.hasSuffix("/") ? String(url.dropLast()) : url
    }

    func analyzeStream(
        frames: [UIImage],
        taskMode: String,
        sessionId: String
    ) async throws -> StreamAnalysisResponse {
        let url = URL(string: "\(baseURL)/analyze-stream")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        appendFormField(to: &body, boundary: boundary, name: "task_mode", value: taskMode)
        appendFormField(to: &body, boundary: boundary, name: "session_id", value: sessionId)

        for (index, image) in frames.enumerated() {
            guard let jpegData = normalizedJPEGData(from: image) else { continue }
            appendFileField(
                to: &body,
                boundary: boundary,
                name: "frames",
                filename: "frame_\(index).jpg",
                mimeType: "image/jpeg",
                data: jpegData
            )
        }

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let detail = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError.serverError(statusCode: httpResponse.statusCode, detail: detail)
        }

        let decoder = JSONDecoder()
        return try decoder.decode(StreamAnalysisResponse.self, from: data)
    }

    func healthCheck() async -> Bool {
        guard let url = URL(string: "\(baseURL)/health") else { return false }
        do {
            let (_, response) = try await session.data(from: url)
            return (response as? HTTPURLResponse)?.statusCode == 200
        } catch {
            return false
        }
    }

    // MARK: - Image normalization

    /// Re-renders a UIImage into a standard sRGB bitmap so JPEG encoding
    /// succeeds even for frames from non-standard pixel formats (e.g. Meta DAT SDK).
    private func normalizedJPEGData(from image: UIImage) -> Data? {
        if let direct = image.jpegData(compressionQuality: jpegQuality),
           direct.count > 100 {
            return direct
        }

        let size = image.size
        UIGraphicsBeginImageContextWithOptions(size, true, 1.0)
        defer { UIGraphicsEndImageContext() }
        image.draw(in: CGRect(origin: .zero, size: size))
        guard let redrawn = UIGraphicsGetImageFromCurrentImageContext() else { return nil }
        return redrawn.jpegData(compressionQuality: jpegQuality)
    }

    // MARK: - Multipart helpers

    private func appendFormField(to body: inout Data, boundary: String, name: String, value: String) {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(value)\r\n".data(using: .utf8)!)
    }

    private func appendFileField(
        to body: inout Data,
        boundary: String,
        name: String,
        filename: String,
        mimeType: String,
        data: Data
    ) {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append(
            "Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!
        )
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)
    }
}

enum APIError: LocalizedError {
    case invalidResponse
    case serverError(statusCode: Int, detail: String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid server response"
        case .serverError(let code, let detail):
            return "Server error \(code): \(detail)"
        }
    }
}
