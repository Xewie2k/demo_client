package com.example.datn_sevenstrike.controller;

import com.example.datn_sevenstrike.dto.chat.*;
import com.example.datn_sevenstrike.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // ─── WebSocket: Khách gửi tin nhắn ──────────────────────────────────────
    @MessageMapping("/chat/{id}/send")
    public void khachGuiTin(@DestinationVariable Integer id,
                             @Payload GuiTinNhanRequest req) {
        chatService.xuLyTinNhanKhach(id, req);
    }

    // ─── WebSocket: Nhân viên gửi tin nhắn ──────────────────────────────────
    @MessageMapping("/chat/{id}/nhanvien/send")
    public void nhanVienGuiTin(@DestinationVariable Integer id,
                                @Payload GuiTinNhanRequest req) {
        chatService.nhanVienGuiTin(id, req);
    }

    // ─── WebSocket: Đóng phiên ───────────────────────────────────────────────
    @MessageMapping("/chat/{id}/close")
    public void dongPhienWs(@DestinationVariable Integer id) {
        chatService.dongPhien(id);
    }

    // ─── REST: Khởi tạo phiên mới ────────────────────────────────────────────
    @PostMapping("/api/chat/start")
    @ResponseBody
    public ResponseEntity<PhienChatDTO> khoiTaoPhien(@RequestBody KhoiTaoPhienRequest req) {
        PhienChatDTO dto = chatService.khoiTaoPhien(req);
        return ResponseEntity.ok(dto);
    }

    // ─── REST: Nhân viên nhận phiên ──────────────────────────────────────────
    @PostMapping("/api/chat/{id}/accept")
    @ResponseBody
    public ResponseEntity<PhienChatDTO> nhanPhien(@PathVariable Integer id,
                                                   @RequestBody Map<String, Integer> body) {
        Integer nhanVienId = body.get("nhanVienId");
        return ResponseEntity.ok(chatService.nhanVienNhanPhien(id, nhanVienId));
    }

    // ─── REST: Đóng phiên ────────────────────────────────────────────────────
    @PostMapping("/api/chat/{id}/close")
    @ResponseBody
    public ResponseEntity<Void> dongPhien(@PathVariable Integer id) {
        chatService.dongPhien(id);
        return ResponseEntity.ok().build();
    }

    // ─── REST: Nhân viên khởi tạo phiên nội bộ ──────────────────────────────
    @PostMapping("/api/chat/staff/start")
    @ResponseBody
    public ResponseEntity<PhienChatDTO> khoiTaoPhienNoiBo(@RequestBody KhoiTaoPhienRequest req) {
        req.setLoai("NOI_BO");
        PhienChatDTO dto = chatService.khoiTaoPhien(req);
        return ResponseEntity.ok(dto);
    }

    // ─── REST: Danh sách phiên (admin) ───────────────────────────────────────
    @GetMapping("/api/chat/sessions")
    @ResponseBody
    public ResponseEntity<List<PhienChatDTO>> layDanhSachPhien(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String loai) {
        return ResponseEntity.ok(chatService.layDanhSachPhien(trangThai, loai));
    }

    // ─── REST: Lịch sử tin nhắn ──────────────────────────────────────────────
    @GetMapping("/api/chat/{id}/messages")
    @ResponseBody
    public ResponseEntity<List<TinNhanDTO>> layTinNhan(@PathVariable Integer id) {
        return ResponseEntity.ok(chatService.layTinNhan(id));
    }
}
