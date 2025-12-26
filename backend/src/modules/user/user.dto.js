/**
 * DTO helpers for User responses.
 * Strips sensitive/internal fields.
 */

function userDTO(user) {
    if (!user) return null;

    return {
        id: user._id || user.id,
        publicId: user.publicId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || null,
        phone: user.phone || null,
        role: user.role || 'user',
        visible: user.visible || true,
        isDeleted: user.isDeleted || false,
        meta: user.meta || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

function usersDTO(users = []) {
    return users.map(userDTO);
}

module.exports = {
    userDTO,
    usersDTO
};
