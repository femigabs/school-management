module.exports = {
    create: [
        {
            label: "capacity",
            model: "capacity",
            type: "Number",
            required: true,
        },
        {
            label: "name",
            model: "name",
            required: true,
        },
        {
            label: "resources",
            model: "resources",
            type: 'Array',
            items: [
                {
                    label: 'type',
                    path: 'type',
                    type: 'String',
                    required: true,
                },
                {
                    label: 'name',
                    path: 'name',
                    type: 'String',
                    required: true,
                },
                {
                    label: 'quantity',
                    path: 'quantity',
                    type: 'Number',
                    required: true,
                },
            ],
        }
    ],
    update: [
        {
            label: "capacity",
            model: "capacity",
            type: "Number",
        },
        {
            label: "name",
            model: "name",
        },
        {
            label: "resources",
            model: "resources",
            type: 'Array',
            items: [
                {
                    label: 'type',
                    path: 'type',
                    type: 'String',
                },
                {
                    label: 'name',
                    path: 'name',
                    type: 'String',
                },
                {
                    label: 'quantity',
                    path: 'quantity',
                    type: 'Number',
                },
            ],
        },
    ],
}


