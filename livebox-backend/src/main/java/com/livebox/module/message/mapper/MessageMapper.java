package com.livebox.module.message.mapper;

import com.livebox.module.message.dto.MessageResponse;
import com.livebox.module.message.entity.Message;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageResponse toResponse(Message message);
}