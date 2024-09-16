export function transformData(data: any): any {
    if (data !== null && typeof data === "object") {
        const transformedObject: any = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                transformedObject[key] = transformData(data[key]);
            } else {
                transformedObject[key] = data[key];
            }
        }
        return transformedObject;
    } else if (data !== null && Array.isArray(data)) {
        return data.map(item => transformData(item));
    }
    return data;
}
