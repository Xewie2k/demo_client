package com.example.datn_sevenstrike.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private static final String SYSTEM_PROMPT =
            "Bạn là trợ lý AI của cửa hàng giày bóng đá SevenStrike. " +
            "Bạn hỗ trợ khách hàng về: sản phẩm giày bóng đá (size, màu sắc, thương hiệu, chất liệu, loại sân), " +
            "chính sách đổi trả, vận chuyển, khuyến mãi và voucher giảm giá. " +
            "Nếu câu hỏi liên quan đến khiếu nại, hoàn tiền, lỗi đơn hàng cụ thể, " +
            "hoặc khách yêu cầu nói chuyện với nhân viên — chỉ trả về đúng chuỗi: CHUYEN_NHAN_VIEN " +
            "Trả lời ngắn gọn, thân thiện, bằng tiếng Việt. Không quá 200 từ.";

    private static final String SYSTEM_PROMPT_NOI_BO =
            "Bạn là trợ lý AI nội bộ của cửa hàng giày bóng đá SevenStrike, hỗ trợ nhân viên về: " +
            "quy trình bán hàng, quản lý hóa đơn, tra cứu đơn hàng, lịch làm việc, " +
            "chính sách nội bộ, quy định đổi ca, tồn kho sản phẩm. " +
            "Nếu vấn đề cần sự phê duyệt của quản lý hoặc admin (ví dụ: hoàn tiền lớn, xử lý khiếu nại đặc biệt, " +
            "thay đổi chính sách) — chỉ trả về đúng chuỗi: CHUYEN_NHAN_VIEN " +
            "Trả lời ngắn gọn, chuyên nghiệp, bằng tiếng Việt. Không quá 200 từ.";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Gửi tin nhắn tới Gemini và nhận phản hồi.
     * Trả về "CHUYEN_NHAN_VIEN" nếu cần chuyển nhân viên.
     */
    public String hoiGemini(String tinNhanKhach) {
        return goiGemini(SYSTEM_PROMPT, tinNhanKhach,
                "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.");
    }

    /**
     * Gửi tin nhắn nội bộ tới Gemini với system prompt dành cho nhân viên.
     * Trả về "CHUYEN_NHAN_VIEN" nếu cần chuyển lên admin.
     */
    public String hoiGeminiNoiBo(String tinNhan) {
        return goiGemini(SYSTEM_PROMPT_NOI_BO, tinNhan,
                "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu. Vui lòng thử lại sau.");
    }

    /**
     * Gọi Gemini API với retry tự động khi bị 429 (rate limit).
     * Thử tối đa 3 lần, mỗi lần chờ 3 giây.
     */
    private String goiGemini(String systemPrompt, String tinNhan, String fallback) {
        String url = GEMINI_URL + apiKey;

        Map<String, Object> systemInstruction = new LinkedHashMap<>();
        systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));

        Map<String, Object> userContent = Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", tinNhan))
        );

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("system_instruction", systemInstruction);
        requestBody.put("contents", List.of(userContent));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int maxRetry = 3;
        for (int attempt = 1; attempt <= maxRetry; attempt++) {
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return extractText(response.getBody());
                }
            } catch (HttpClientErrorException e) {
                int status = e.getStatusCode().value();
                if (status == 429 && attempt < maxRetry) {
                    System.err.println("[GeminiService] Rate limit 429, chờ 3s rồi thử lại (lần " + attempt + ")...");
                    try { Thread.sleep(3000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                } else {
                    System.err.println("[GeminiService] Lỗi HTTP " + status + ": " + e.getMessage());
                    break;
                }
            } catch (Exception e) {
                System.err.println("[GeminiService] Lỗi gọi Gemini API: " + e.getMessage());
                break;
            }
        }
        return fallback;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> body) {
        try {
            List<?> candidates = (List<?>) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                List<?> parts = (List<?>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    Map<?, ?> part = (Map<?, ?>) parts.get(0);
                    return String.valueOf(part.get("text")).trim();
                }
            }
        } catch (Exception e) {
            System.err.println("[GeminiService] Lỗi parse response: " + e.getMessage());
        }
        return "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không?";
    }
}
