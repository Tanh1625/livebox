package com.livebox.module.channel.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.channel.dto.ChannelCreateRequest;
import com.livebox.module.channel.dto.ChannelResponse;
import com.livebox.module.channel.service.ChannelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/servers/{serverId}/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;

    // LB-302: Tạo kênh (Owner only)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChannelResponse> createChannel(
            @PathVariable UUID serverId,
            @Valid @RequestBody ChannelCreateRequest request) {
        return ApiResponse.created(channelService.createChannel(serverId, request));
    }

    // LB-303: Danh sách kênh (Member only)
    @GetMapping
    public ApiResponse<List<ChannelResponse>> getChannels(@PathVariable UUID serverId) {
        return ApiResponse.success(channelService.getChannelsByServerId(serverId));
    }

    // LB-302: Đổi tên kênh (Owner only)
    @PatchMapping("/{channelId}")
    public ApiResponse<ChannelResponse> renameChannel(
            @PathVariable UUID serverId,
            @PathVariable UUID channelId,
            @RequestParam String name) {
        return ApiResponse.success(channelService.renameChannel(serverId, channelId, name));
    }

    // LB-302: Xóa kênh (Owner only)
    @DeleteMapping("/{channelId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChannel(
            @PathVariable UUID serverId,
            @PathVariable UUID channelId) {
        channelService.deleteChannel(serverId, channelId);
    }
}
