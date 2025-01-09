const emojis = require('../../public/emojis.data.json');

module.exports = {
    id: {
        path: "id",
        type: "string",
    },
    username: {
        path: 'username',
        type: 'string',
        length: { min: 3, max: 20 },
        custom: 'username',
    },
    gender: {
        path: 'gender',
        type: 'string',
    },
    contactEmail: {
        path: 'contactEmail',
        type: 'string',
        length: { min: 3, max: 100 },
        regex: '^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$',
    },
    contactPhone: {
        path: 'contactPhone',
        type: 'String',
    },
    dateOfBirth: {
        path: 'dateOfBirth',
        type: 'String',
        // regex: '^\d{4}-\d{2}-\d{2}$'
    },
    name: {
        path: 'name',
        type: 'string',
    },
    schoolId: {
        path: 'role',
        type: 'string',
    },
    role: {
        path: 'role',
        type: 'string',
    },
    capacity: {
        path: 'capacity',
        type: 'Number',
    },
    resources: {
        path: 'resources',
        type: 'Array',
        items: [
            {
                path: 'type',
                type: 'String',
            },
            {
                path: 'name',
                type: 'String',
            },
            {
                path: 'quantity',
                type: 'Number',
            },
        ]
    },
    userId: {
        path: 'userId',
        type: 'string',
    },
    schoolId: {
        path: 'schoolId',
        type: 'string',
    },
    address: {
        path: 'address',
        type: 'string',
    },
    password: {
        path: 'password',
        type: 'string',
        length: { min: 7, max: 100 },
    },
    oldPassword: {
        path: 'oldPassword',
        type: 'string',
        length: { min: 7, max: 100 },
    },
    newPassword: {
        path: 'oldPassword',
        type: 'string',
        length: { min: 7, max: 100 },
    },
    email: {
        path: 'email',
        type: 'string',
        length: { min: 3, max: 100 },
        regex: '^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$',
    },
    phone: {
        path: 'phone',
        type: 'String',
    },
    title: {
        path: 'title',
        type: 'string',
        length: { min: 3, max: 300 }
    },
    label: {
        path: 'label',
        type: 'string',
        length: { min: 3, max: 100 }
    },
    shortDesc: {
        path: 'desc',
        type: 'string',
        length: { min: 3, max: 300 }
    },
    longDesc: {
        path: 'desc',
        type: 'string',
        length: { min: 3, max: 2000 }
    },
    url: {
        path: 'url',
        type: 'string',
        length: { min: 9, max: 300 },
    },
    emoji: {
        path: 'emoji',
        type: 'Array',
        items: {
            type: 'string',
            length: { min: 1, max: 10 },
            oneOf: emojis.value,
        }
    },
    price: {
        path: 'price',
        type: 'number',
    },
    avatar: {
        path: 'avatar',
        type: 'string',
        length: { min: 8, max: 100 },
    },
    text: {
        type: 'String',
        length: { min: 3, max: 15 },
    },
    longText: {
        type: 'String',
        length: { min: 3, max: 250 },
    },
    paragraph: {
        type: 'String',
        length: { min: 3, max: 10000 },
    },
    number: {
        type: 'Number',
        length: { min: 1, max: 6 },
    },
    arrayOfStrings: {
        type: 'Array',
        items: {
            type: 'String',
            length: { min: 3, max: 100 }
        }
    },
    obj: {
        type: 'Object',
    },
    bool: {
        type: 'Boolean',
    },
}