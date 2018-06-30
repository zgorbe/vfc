import _ from 'lodash';

const chess = {
    moveConfig: {
        p : {}, // pawn, maybe it has too special move... important whether black or white pawn
        b : { moveInVH : true }, // rock
        h : { moveInLShape : true }, // knight
        f : { moveInCross : true }, // bishop
        k : { moveInVH: true, moveInCross: true, moveToNextFieldOnly: true }, // king
        v : { moveInVH: true, moveInCross: true } //queen
    },

    _filterToNextFieldOnly(fields) {
        return _.chain(fields).take(1).compact().value();
    },

    _filterValidFields(color, fields, table) {
        var validFields = [];

        _.each(fields, field => {
            if (field.row < 1 || field.row > 8 || field.index < 1 || field.index > 8) {
                return false;
            }
            var figure = table[field.row - 1].charAt(field.index - 1),
                figureColor = figure.toUpperCase() == figure ? 'white' : 'black';
            
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
    },

    _getValidAvailableFields(fields, table, moveToNextFieldOnly, color) {
        if (moveToNextFieldOnly) {
            for (var i = 0; i < 4; i++) {
                fields[i] = this._filterToNextFieldOnly(fields[i]);
            }
        }
        for (var i = 0; i < 4; i++) {
            fields[i] = this._filterValidFields(color, fields[i], table);
        }

        return [...fields[0], ...fields[1], ...fields[2], ...fields[3]];
    },

    _getFieldsInVH(field, table, moveToNextFieldOnly) {
        var color = field.figure.toUpperCase() == field.figure ? 'white' : 'black';

        var fieldsUp = _.range(field.row - 1, 0, -1).map(i => ({ row: i, index: field.index })),
            fieldsRight = _.range(field.index + 1, 9).map(i => ({ row: field.row, index: i })),
            fieldsDown = _.range(field.row + 1, 9).map(i => ({ row: i, index: field.index })),
            fieldsLeft = _.range(field.index - 1, 0, -1).map(i => ({ row: field.row, index: i }));

        return this._getValidAvailableFields(
            [fieldsUp, fieldsRight, fieldsDown, fieldsLeft], 
            table, 
            moveToNextFieldOnly, 
            color
        );
    },

    _getFieldsInCross(field, table, moveToNextFieldOnly) {
        var color = field.figure.toUpperCase() == field.figure ? 'white' : 'black';

        var fieldsUpRight = _.range(field.row - 1, 0, -1).map((i, index) => ({ row: i, index: field.index + index + 1 })),
            fieldsDownRight = _.range(field.index + 1, 9).map((i, index) => ({ row: field.row + index + 1, index: i })),
            fieldsDownLeft = _.range(field.row + 1, 9).map((i, index) => ({ row: i, index: field.index - index - 1})),
            fieldsUpLeft = _.range(field.index - 1, 0, -1).map((i, index) => ({ row: field.row - index - 1, index: i }));

        return this._getValidAvailableFields(
            [fieldsUpRight, fieldsDownRight, fieldsDownLeft, fieldsUpLeft], 
            table, 
            moveToNextFieldOnly, 
            color
        );
    },

    getAvailableFields(field, table) {
        var moveConfig = this.moveConfig[field.figure.toLowerCase()],
            availableFields = [];

        if (moveConfig.moveInVH) {
            availableFields = _.concat(availableFields, this._getFieldsInVH(field, table, moveConfig.moveToNextFieldOnly));
        }

        if (moveConfig.moveInCross) {
            availableFields = _.concat(availableFields, this._getFieldsInCross(field, table, moveConfig.moveToNextFieldOnly));
        }
        return availableFields;
    }
}

export default chess;