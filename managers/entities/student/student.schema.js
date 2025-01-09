module.exports = {
    enroll: [
        {
            label: "contactEmail",
            model: "contactEmail",
            required: true,
        },
        {
            label: "contactPhone",
            model: "contactPhone",
            required: true,
        },
        {
            label: "name",
            model: "name",
            required: true,
        },
        {
            label: "dateOfBirth",
            model: "dateOfBirth",
            required: true,
        },
        {
            label: "gender",
            model: "gender",
            required: true,
            oneOf: ['male','female']
        }
    ],
    update: [
        {
            label: "contactEmail",
            model: "contactEmail",
        },
        {
            label: "contactPhone",
            model: "contactPhone",
        },
        {
            label: "name",
            model: "name",
        },
        {
            label: "dateOfBirth",
            model: "dateOfBirth",
        },
        {
            label: "gender",
            model: "gender",
            oneOf: ['male','female']
        },
        {
            label: "schoolId",
            model: "schoolId",
        }
    ],
};

