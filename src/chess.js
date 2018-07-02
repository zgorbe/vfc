import _ from 'lodash';

const moveConfig = {
    p : { moveLikeAPawn: true }, // pawn, maybe it has too special move... important whether black or white pawn
    b : { moveInVH : true }, // rock
    h : { moveInLShape : true }, // knight
    f : { moveInCross : true }, // bishop
    k : { moveInVH: true, moveInCross: true, moveToNextFieldOnly: true }, // king
    v : { moveInVH: true, moveInCross: true } //queen
}

function getFigureColor(figure) {
    return figure.toUpperCase() == figure ? 'white' : 'black';
}

function filterToNextFieldOnly(fields) {
    return _.chain(fields).take(1).compact().value();
}

function filterValidFields(color, fields, table) {
    var validFields = [];

    _.each(fields, field => {
        if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
            return false;
        }
        var figure = table[field.row - 1].charAt(field.index - 1),
            figureColor = getFigureColor(figure);
        
        if (figure == 'X') {
            validFields.push(field);
        } else {
            if (color != figureColor) {
                field.isAttackedField = true;
                validFields.push(field);
            }
            return false;
        }
    });

    return validFields;
}

function getValidAvailableFields(fields, table, moveToNextFieldOnly, color) {
    if (moveToNextFieldOnly) {
        for (var i = 0; i < 4; i++) {
            fields[i] = filterToNextFieldOnly(fields[i]);
        }
    }
    for (var i = 0; i < 4; i++) {
        fields[i] = filterValidFields(color, fields[i], table);
    }

    return [...fields[0], ...fields[1], ...fields[2], ...fields[3]];
}

function getFieldsInVH(field, table, moveToNextFieldOnly) {
    var color = getFigureColor(field.figure);

    var fieldsUp = _.range(field.row - 1, 0, -1).map(i => ({ row: i, index: field.index })),
        fieldsRight = _.range(field.index + 1, 9).map(i => ({ row: field.row, index: i })),
        fieldsDown = _.range(field.row + 1, 9).map(i => ({ row: i, index: field.index })),
        fieldsLeft = _.range(field.index - 1, 0, -1).map(i => ({ row: field.row, index: i }));

    return getValidAvailableFields(
        [fieldsUp, fieldsRight, fieldsDown, fieldsLeft], 
        table, 
        moveToNextFieldOnly, 
        color
    );
}

function getFieldsInCross(field, table, moveToNextFieldOnly) {
    var color = getFigureColor(field.figure);

    var fieldsUpRight = _.range(field.row - 1, 0, -1).map((i, index) => ({ row: i, index: field.index + index + 1 })),
        fieldsDownRight = _.range(field.index + 1, 9).map((i, index) => ({ row: field.row + index + 1, index: i })),
        fieldsDownLeft = _.range(field.row + 1, 9).map((i, index) => ({ row: i, index: field.index - index - 1})),
        fieldsUpLeft = _.range(field.index - 1, 0, -1).map((i, index) => ({ row: field.row - index - 1, index: i }));

    return getValidAvailableFields(
        [fieldsUpRight, fieldsDownRight, fieldsDownLeft, fieldsUpLeft], 
        table, 
        moveToNextFieldOnly, 
        color
    );
}

function getFieldsInLShape(field, table) {
    var color = getFigureColor(field.figure);

    var upArray = [
        [{ row: field.row - 1, index: field.index - 2 }],
        [{ row: field.row - 2, index: field.index - 1 }],
        [{ row: field.row - 1, index: field.index + 2 }],
        [{ row: field.row - 2, index: field.index + 1 }]
    ];
    var downArray = [
        [{ row: field.row + 1, index: field.index - 2 }],
        [{ row: field.row + 2, index: field.index - 1 }],
        [{ row: field.row + 1, index: field.index + 2 }],
        [{ row: field.row + 2, index: field.index + 1 }]
    ];

    return [
        ...getValidAvailableFields(upArray, table, false, color),
        ...getValidAvailableFields(downArray, table, false, color)
    ]
}

function getFieldsForPawn(field, table) {
    var color = getFigureColor(field.figure),
        availableFields = [];

    var fieldsInFront = [
        { row: color == 'white' ? field.row - 1 : field.row + 1, index: field.index }
    ];

    var fieldsInCross = [
        { row: color == 'white' ? field.row - 1 : field.row + 1, index: field.index - 1 },
        { row: color == 'white' ? field.row - 1 : field.row + 1, index: field.index + 1 }
    ];

    if (color == 'white' && field.row == 7) {
        fieldsInFront.push({ row: field.row - 2, index: field.index });
    }

    if (color == 'black' && field.row == 2) {
        fieldsInFront.push({ row: field.row + 2, index: field.index });
    }

    _.each(fieldsInFront, field => {
        if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
            return;
        }
        var figure = table[field.row - 1].charAt(field.index - 1);
        if (figure == 'X') {
            availableFields.push(field);
        }
    });

    _.each(fieldsInCross, field => {
        if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
            return;
        }
        var figure = table[field.row - 1].charAt(field.index - 1),
            figureColor = getFigureColor(figure);
        if (figure != 'X' && color != figureColor) {
            field.isAttackedField = true;
            availableFields.push(field);
        }
    });


    return availableFields;
}

const chess = {
    getFigureColor(figure) {
        return getFigureColor(figure);
    },

    getAvailableFields(field, table) {
        var config = moveConfig[field.figure.toLowerCase()],
            availableFields = [];

        if (config.moveInVH) {
            availableFields = _.concat(availableFields, getFieldsInVH(field, table, config.moveToNextFieldOnly));
        }

        if (config.moveInCross) {
            availableFields = _.concat(availableFields, getFieldsInCross(field, table, config.moveToNextFieldOnly));
        }

        if (config.moveInLShape) {
            availableFields = _.concat(availableFields, getFieldsInLShape(field, table));
        }

        if (config.moveLikeAPawn) {
            availableFields = _.concat(availableFields, getFieldsForPawn(field, table));
        }
        return availableFields;
    }
}

export default chess;