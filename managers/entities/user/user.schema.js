module.exports = {
    create: [
        {
            label: "email",
            model: "email",
            required: true,
        },
        {
            label: "name",
            model: "name",
            required: true,
        },
        {
            label: "role",
            model: "role",
            required: true,
            oneOf: ['superadmin','admin']
        },
        {
            label: "schoolId",
            model: "schoolId",
        }
    ],
    login: [
        {
            label: "email",
            model: "email",
            required: true,
        },
        {
            label: "password",
            model: "password",
            type: "String",
            required: true,
        }, 
    ],
    changePassword: [
        {
            label: "oldPassword",
            model: "oldPassword",
            type: "String",
            required: true,
        },
        {
            label: "newPassword",
            model: "newPassword",
            type: "String",
            required: true,
        },
    ],
};

