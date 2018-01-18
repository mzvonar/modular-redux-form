export default function getPath(name) {
    const parts = name.split('.');
    const path = [];

    for(let i = 0, length = parts.length; i < length; i += 1) {
        const matches = parts[i].match(/(.+)\[(\d+)\]/);

        if(matches) {
            path.push(matches[1], parseInt(matches[2], 10));
        }
        else {
            path.push(parts[i])
        }
    }

    return path;
};