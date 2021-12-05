import { SingleFindConditions, SymbiosisError } from "@techmmunity/symbiosis";
import type { ColumnMetadata } from "@techmmunity/symbiosis/lib/entity-manager/types/column-metadata";
import type { EntityMetadata } from "@techmmunity/symbiosis/lib/entity-manager/types/entity-metadata";
import type { DatabaseEntity } from "@techmmunity/symbiosis/lib/types/database-entity";
import { cleanObj, getTypeof, isEmptyObject } from "@techmmunity/utils";

import type { ExtraMetadata } from "../../../types/extra-metadata";

interface ValidatePrimaryColumns {
	startFrom: Partial<DatabaseEntity>;
	primaryColumns: Array<ColumnMetadata<ExtraMetadata["column"]>>;
	entityMetadata: EntityMetadata<ExtraMetadata>;
}

const throwDefaultError = (extraDetails?: Array<any>) => {
	throw new SymbiosisError({
		code: "INVALID_PARAM",
		origin: "SYMBIOSIS",
		message: "Invalid Params",
		details: [
			"To use the startFrom option, you must specify ALL AND ONLY the primary columns of the last value of previous operation.",
			...(extraDetails || []),
		],
	});
};

const validateHasTheSameLength = (
	primaryColumns: Array<ColumnMetadata<ExtraMetadata["column"]>>,
	startFromKeys: Array<string>,
	entityMetadata: EntityMetadata<ExtraMetadata>,
) => {
	if (startFromKeys.length !== primaryColumns.length) {
		return throwDefaultError([
			`In the entity "${
				entityMetadata.name
			}", the primary columns are: ${primaryColumns
				.map(column => column.name)
				.join(", ")}`,
		]);
	}
};

const validateAreTheSamePrimaryKeys = (
	primaryColumns: Array<ColumnMetadata<ExtraMetadata["column"]>>,
	startFromKeys: Array<string>,
	entityMetadata: EntityMetadata<ExtraMetadata>,
) => {
	const primaryColumnsKeys = primaryColumns.map(col => col.databaseName);

	const notAreTheSameKeys = primaryColumnsKeys.some(
		key => !startFromKeys.includes(key),
	);

	if (notAreTheSameKeys) {
		return throwDefaultError([
			`In the entity "${
				entityMetadata.name
			}", the primary columns are: ${primaryColumns
				.map(column => column.name)
				.join(", ")}`,
		]);
	}
};

const validateValues = (startFrom: SingleFindConditions<DatabaseEntity>) => {
	Object.values(startFrom).forEach(val => {
		switch (getTypeof(val)) {
			case "number":
			case "string":
				return;
			default:
				return throwDefaultError([
					'The only types of values accepted for this method are "number" and "string"',
				]);
		}
	});
};

export const validatePrimaryColumns = ({
	startFrom,
	primaryColumns,
	entityMetadata,
}: ValidatePrimaryColumns) => {
	if (!startFrom) return;

	const cleanedStartFrom = cleanObj(startFrom);

	if (isEmptyObject(cleanedStartFrom)) return;

	const startFromKeys = Object.keys(cleanedStartFrom);

	validateHasTheSameLength(primaryColumns, startFromKeys, entityMetadata);

	validateAreTheSamePrimaryKeys(primaryColumns, startFromKeys, entityMetadata);

	validateValues(cleanedStartFrom);
};
