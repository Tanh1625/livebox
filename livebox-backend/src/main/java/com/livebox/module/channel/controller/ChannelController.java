package com.livebox.module.channel.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.channel.dto.ChannelCreateRequest;
import com.livebox.module.channel.dto.ChannelResponse;
import com.livebox.module.channel.service.ChannelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/servers/{serverId}/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChannelResponse>> createChannel(
            @PathVariable UUID serverId,
            @Valid @RequestBody ChannelCreateRequest request) {
        ChannelResponse response = channelService.createChannel(serverId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChannelResponse>>> getChannelsByServerId(
            @PathVariable UUID serverId) {
        return ResponseEntity.ok(ApiResponse.success(channelService.getChannelsByServerId(serverId)));
    }

    @DeleteMapping("/{channelId}")
    public ResponseEntity<ApiResponse<Void>> deleteChannel(
            @PathVariable UUID serverId,
            @PathVariable UUID channelId) {
        channelService.deleteChannel(serverId, channelId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
