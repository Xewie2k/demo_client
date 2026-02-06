package com.example.datn_sevenstrike.controller;

import com.example.datn_sevenstrike.dto.client.*;
import com.example.datn_sevenstrike.service.BanHangOnlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientController {

    private final BanHangOnlineService service;

    @GetMapping("/products")
    public ResponseEntity<List<ProductClientDTO>> getProducts() {
        return ResponseEntity.ok(service.getProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDetailClientDTO> getProductDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getProductDetail(id));
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<VoucherClientDTO>> getVouchers() {
        return ResponseEntity.ok(service.getVouchers());
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest req) {
        return ResponseEntity.ok(service.createOrder(req));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<ClientOrderHistoryDTO>> getOrders(@RequestParam(required = false) Integer customerId) {
        return ResponseEntity.ok(service.getOrdersByCustomerId(customerId));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ClientOrderDetailDTO> getOrderDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getOrderDetail(id));
    }
}
