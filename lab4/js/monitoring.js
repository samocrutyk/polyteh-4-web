'use strict';

const noiseLevels = [
    42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
    53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
    79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

// Function Declaration
function isValidLevel(level, min, max) {
    return Number.isFinite(level) && level >= min && level <= max;
}

function findFirstCritical(data, critical) {
    for (let i = 0; i < data.length; i++) {
        if (isValidLevel(data[i], minValidLevel, maxValidLevel) && data[i] > critical) {
            return { value: data[i], position: i + 1 };
        }
    }
    return null;
}

function calculateAverage(data, min, max) {
    let sum = 0;
    let count = 0;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        sum += level;
        count++;
    }

    return count === 0 ? null : sum / count;
}

function findMinimum(data, min, max) {
    let minimum = null;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        if (minimum === null || level < minimum) {
            minimum = level;
        }
    }

    return minimum;
}

function findMaximum(data, min, max) {
    let maximum = null;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        if (maximum === null || level > maximum) {
            maximum = level;
        }
    }

    return maximum;
}

function countByCategory(data, warning, critical, min, max) {
    const result = {
        safe: 0,
        warning: 0,
        critical: 0,
        invalid: 0,
        valid: 0
    };

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            result.invalid++;
            continue;
        }

        result.valid++;

        if (level <= warning) {
            result.safe++;
        } else if (level <= critical) {
            result.warning++;
        } else {
            result.critical++;
        }
    }

    return result;
}

function findRecovery(data, startIndex, warning, min, max) {
    let index = startIndex + 1;
    let safeCount = 0;

    while (index < data.length) {
        const level = data[index];

        if (isValidLevel(level, min, max) && level <= warning) {
            safeCount++;
            if (safeCount === 3) {
                return index + 1;
            }
        } else {
            safeCount = 0;
        }

        index++;
    }

    return null;
}

function findFirstValid(data, min, max) {
    if (data.length === 0) {
        return null;
    }

    let index = 0;
    let level;

    do {
        level = data[index];
        if (isValidLevel(level, min, max)) {
            return { value: level, position: index + 1 };
        }
        index++;
    } while (index < data.length);

    return null;
}

// Function Expression + callback
const classifyLevel = function (level, warning, critical) {
    if (level <= warning) return 'Без перевищення';
    if (level <= critical) return 'Попередження';
    return 'Критичний';
};

function processLevels(data, callback, warning, critical, min, max) {
    const result = [];

    for (const level of data) {
        if (isValidLevel(level, min, max)) {
            result.push(callback(level, warning, critical));
        }
    }

    return result;
}

// Arrow Functions
const statusLabel = value => `Рівень: ${value} dB`;
const isAbove = (value, threshold) => value > threshold;

const categories = countByCategory(
    noiseLevels,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel
);

let totalSum = 0;
let validCount = 0;

for (const level of noiseLevels) {
    if (!isValidLevel(level, minValidLevel, maxValidLevel)) {
        continue;
    }
    totalSum += level;
    validCount++;
}

const average = validCount === 0 ? null : totalSum / validCount;
const minimum = findMinimum(noiseLevels, minValidLevel, maxValidLevel);
const maximum = findMaximum(noiseLevels, minValidLevel, maxValidLevel);
const firstCritical = findFirstCritical(noiseLevels, criticalLevel);
const recovery = firstCritical
    ? findRecovery(noiseLevels, firstCritical.position - 1, warningLevel, minValidLevel, maxValidLevel)
    : null;
const firstValid = findFirstValid(noiseLevels, minValidLevel, maxValidLevel);
const classifiedLevels = processLevels(
    noiseLevels,
    classifyLevel,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel
);

console.group('Акустична варта -- звіт моніторингу');
console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
console.log(`Усього вимірювань: ${noiseLevels.length}`);
console.log(`Коректних: ${categories.valid}`);
console.log(`Некоректних: ${categories.invalid}`);
console.table([
    { Категорія: 'Без перевищення', Кількість: categories.safe },
    { Категорія: 'Попередження', Кількість: categories.warning },
    { Категорія: 'Критичні', Кількість: categories.critical }
]);
console.log(`Середній рівень: ${average === null ? null : average.toFixed(2)} dB`);
console.log(`Мінімальний рівень: ${minimum} dB`);
console.log(`Максимальний рівень: ${maximum} dB`);
console.log(
    `Перше критичне вимірювання: ${firstCritical ? `${firstCritical.value} dB, позиція ${firstCritical.position}` : 'не знайдено'}`
);
console.log(
    `Відновлення -- три безпечні вимірювання поспіль: ${recovery === null ? 'не знайдено' : `позиція ${recovery}`}`
);
console.log(`Поріг ${warningLevel} dB перевищено у ${categories.warning + categories.critical} вимірюваннях.`);

const invalidPositions = [];
for (let i = 0; i < noiseLevels.length; i++) {
    if (!isValidLevel(noiseLevels[i], minValidLevel, maxValidLevel)) {
        invalidPositions.push(`позиція ${i + 1} (${noiseLevels[i]} dB)`);
    }
}

if (invalidPositions.length > 0) {
    console.error(`Некоректні дані: ${invalidPositions.join(', ')}.`);
}

if (categories.warning + categories.critical > 0) {
    console.warn(`Є вимірювання вище порога ${warningLevel} dB.`);
}

console.log(`Висновок: зафіксовано ${categories.critical} критичні вимірювання; ${recovery === null ? 'після першого з них стійкого відновлення не виявлено.' : `відновлення зафіксовано на позиції ${recovery}.`}`);
console.groupEnd();

// Додаткові перевірки з умови лабораторної роботи
console.group('Додаткові тести');
console.log('Порожній масив:', {
    average: calculateAverage([], minValidLevel, maxValidLevel),
    minimum: findMinimum([], minValidLevel, maxValidLevel),
    maximum: findMaximum([], minValidLevel, maxValidLevel),
    firstValid: findFirstValid([], minValidLevel, maxValidLevel)
});
console.log('Тільки некоректні:', findFirstValid([-1, 141], minValidLevel, maxValidLevel));
console.log('Пороги [70, 85, 86]:', processLevels(
    [70, 85, 86],
    classifyLevel,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel
));
console.log('Arrow Function:', statusLabel(58));
console.log('Arrow Function:', isAbove(91, criticalLevel));
console.log('Function Expression:', classifiedLevels.slice(0, 3));
console.log('Перше коректне:', firstValid);
console.groupEnd();
