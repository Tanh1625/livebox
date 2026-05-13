package com.livebox.module.auth.mapper;

import com.livebox.module.auth.dto.UserProfileResponse;
import com.livebox.module.auth.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserProfileResponse toUserProfileResponse(User user);
}