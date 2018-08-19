import _ from 'lodash';
import mixins from './mixins';

export default {
    getFigureColor,
    getAvailableFields,
    isKingInCheck,
    filterForCheckAfterMove,
    isFigureSelection,
    isAnyMoveAvailable
}

const moveConfig = {
    p : { moveLikeAPawn: true }, // pawn, maybe it has too special move... important whether black or white pawn
    b : { moveInVH : true }, // rook
    h : { moveInLShape : true }, // knight
    f : { moveInCross : true }, // bishop
    k : { moveInVH: true, moveInCross: true, moveToNextFieldOnly: true }, // king
    v : { moveInVH: true, moveInCross: true } //queen
}

function getFigureColor(figure) {
    return figure.toUpperCase() == figure ? 'white' : 'black';
}

// getting the available fields for the figure of the given field
function getAvailableFields(field, table, lastMove, castling) {
    var config = moveConfig[field.figure.toLowerCase()],
        availableFields = [];

    if (config.moveInVH) {
        availableFields.push(...getFieldsInVH(field, table, config.moveToNextFieldOnly));
    }

    if (config.moveInCross) {
        availableFields.push(...getFieldsInCross(field, table, config.moveToNextFieldOnly));
    }

    if (config.moveInLShape) {
        availableFields.push(...getFieldsInLShape(field, table));
    }

    if (config.moveLikeAPawn) {
        availableFields.push(...getFieldsForPawn(field, table, lastMove));
    }

    if (castling) { // king is selected
        availableFields.push(...getFieldsForCastling(field, table, castling));
    }

    return availableFields;
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

function getFieldsForPawn(field, table, lastMove) {
    var color = getFigureColor(field.figure),
        availableFields = [];

    var fieldsInFront = [
        { row: color == 'white' ? field.row - 1 : field.row + 1, index: field.index }
    ];

    var fieldsInCross = [
        { row: color == 'white' ? field.row - 1 : field.row + 1, index: field.index - 1 },
        { row: color == 'white' ? field.row - 1 : field.row + 1, index: field.index + 1 }
    ];

    if (table[fieldsInFront[0].row - 1].charAt(fieldsInFront[0].index - 1) == 'X') {
        if (color == 'white' && field.row == 7) {
            fieldsInFront.push({ row: field.row - 2, index: field.index });
        }

        if (color == 'black' && field.row == 2) {
            fieldsInFront.push({ row: field.row + 2, index: field.index });
        }
    }

    // check if 'en passant' is possible
    if (lastMove && fieldsInFront.length == 1 && lastMove[0].figure.toUpperCase() == 'P' && 
        Math.abs(lastMove[0].row - lastMove[1].row) > 1 &&
        Math.abs(fieldsInFront[0].index - lastMove[0].index) == 1) {
        fieldsInFront.push({ 
            row: fieldsInFront[0].row, 
            index: lastMove[0].index
        });
    }
    for (let field of fieldsInFront) {
        if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
            break;
        }
        var figure = table[field.row - 1].charAt(field.index - 1);
        if (figure == 'X') {
            availableFields.push(field);
        }
    }

    for (let field of fieldsInCross) {
        if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
            break;
        }
        var figure = table[field.row - 1].charAt(field.index - 1),
            figureColor = getFigureColor(figure);
        if (figure != 'X' && color != figureColor) {
            field.isAttackedField = true;
            field.figure = figure;
            availableFields.push(field);
        }
    }

    return availableFields;
}

function getFieldsForCastling(field, table, castling) {
    var color = getFigureColor(field.figure),
        availableFields = [];

    if (!isKingInCheck(color, table) && !castling[color].isKingMoved) {
        var row = color == 'black' ? 1 : 8;
        availableFields = getValidAvailableFields(
            [[{ row: row, index: 3 }, { row: row, index: 4 }], [{ row: row, index: 6 }, { row: row, index: 7 }]],
            table,
            false, 
            color
        );
        // check if rook(s) moved
        availableFields = availableFields.filter(field => {
            var index = field.index == 3 ? 1 : 8;
            return !_.toArray(castling[color].rookMoves).filter(move => {
                return move.row == row && move.index == index;
            }).length;
        });
    }

    return availableFields;
}

function filterToNextFieldOnly(fields) {
    return _.chain(fields).take(1).compact().value();
}

function filterValidFields(color, fields, table) {
    var validFields = [];

    for (let field of fields) {
        if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
            break;
        }
        var figure = table[field.row - 1].charAt(field.index - 1),
            figureColor = getFigureColor(figure);
        
        if (figure == 'X') {
            validFields.push(field);
        } else {
            if (color != figureColor) {
                field.isAttackedField = true;
                field.figure = figure;
                validFields.push(field);
            }
            break;
        }
    }

    return validFields;
}

function getValidAvailableFields(fields, table, moveToNextFieldOnly, color) {
    var result = [];
    
    if (moveToNextFieldOnly) {
        fields.forEach((field, index) => {
            fields[index] = filterToNextFieldOnly(field);
        });
    }

    fields.forEach(field => {
        result.push(...filterValidFields(color, field, table));
    });

    return result;
}

function filterForCheckAfterMove(field, availableFields, table) {
    var color = getFigureColor(field.figure),
        isKingSelected = field.figure.toUpperCase() == 'K';

    var result = availableFields.filter(availableField => {
        var resultTable = table.slice(),
            isUpdateInSameRow = field.row == availableField.row,
            sourceRow = resultTable[field.row - 1],
            figureToMove = sourceRow.charAt(field.index - 1),
            updatedSourceRow = mixins.methods.stringReplaceAt(sourceRow, 'X', field.index - 1),
            targetRow = isUpdateInSameRow ? updatedSourceRow : resultTable[availableField.row - 1],
            updatedTargetRow = mixins.methods.stringReplaceAt(targetRow, figureToMove, availableField.index - 1);

        resultTable[field.row - 1] = updatedSourceRow;
        resultTable[availableField.row - 1] = updatedTargetRow;

        return !isKingInCheck(color, resultTable);
    });

    if (isKingSelected) {
        var nextFields = result.filter(availableField => {
            return Math.abs(field.index - availableField.index) == 1;
        });
        
        result = result.filter(availableField => {
            if (Math.abs(field.index - availableField.index) > 1) {
                var fieldIndex = field.index - availableField.index < 0 ? field.index + 1 : field.index - 1;
                return nextFields.filter(nextField => {
                    return nextField.index == fieldIndex && nextField.row == field.row;
                }).length;
            }

            return true;
        });
    }
    return result;
}

function isFigureSelection(selectedField, currentField) {
    return (selectedField.figure == 'P' && currentField.row == 1) || (selectedField.figure == 'p' && currentField.row == 8);
}

function isKingInCheck(color, table) {
    var attackedFields = getAllAttackedFiedsByColor(color == 'black' ? 'white' : 'black', table);
    return !!attackedFields.filter(field => field.figure.toUpperCase() == 'K').length;
}

function getAllAvailableFields(color, table) {
    var fieldsByColor = getAllFieldsByColor(color, table),
        allAvailableFields = [];
    
    fieldsByColor.forEach(field => {
        allAvailableFields.push(...getAvailableFields(field, table));
    });

    return allAvailableFields;
}

function getAllAttackedFiedsByColor(color, table) {
    return getAllAvailableFields(color, table).filter(field => field.isAttackedField);
}

function getAllFieldsByColor(color, table) {
    var fieldsByColor = [];
    
    table.forEach((row, rowIndex)  => {
        for (var i = 0; i < row.length; i++) {
            var figure = row.charAt(i);
            if (figure != 'X' && getFigureColor(figure) == color) {
                fieldsByColor.push({
                    row: rowIndex + 1,
                    index: i + 1,
                    figure: figure
                });
            }
        }
    });

    return fieldsByColor;
}

function isAnyMoveAvailable(color, table) {
    var fieldsByColor = getAllFieldsByColor(color, table),
        isAnyMoveAvailable = false;

    for (let field of fieldsByColor) {
        var availableFields = getAvailableFields(field, table);

        availableFields = filterForCheckAfterMove(field, availableFields, table);
        
        if (availableFields.length) {
            isAnyMoveAvailable = true;
            break;
        }
    }

    return isAnyMoveAvailable;
}