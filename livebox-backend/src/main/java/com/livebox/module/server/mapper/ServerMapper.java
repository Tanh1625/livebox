package com.livebox.module.server.mapper;

import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.entity.Server;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ServerMapper {
    ServerResponse toResponse(Server server);
}