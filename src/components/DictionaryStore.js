export function DictionaryStore() {
    this.data = {};
}


DictionaryStore.prototype.add = function (key, value) {
    if (!this.data[key]) {
        this.data[key] = []
    }
    this.data[key].push(value)
}

DictionaryStore.prototype.get = function (key) {
    console.log(this.data[key])
    return this.data[key][0]
}

DictionaryStore.prototype.contains = function (key, value) {
    if (this.data[key]) {
        for (let c of this.data[key]) {
            console.log("comparing " + c + " and " + value)
            if (value === c) {
                return true;
            }
        }
    }
    return false
}

//returns a boolean indicating whether or not the entire key is gone
DictionaryStore.prototype.remove = function (key, value) {
    if (this.data[key]) {
        this.data[key] = this.data[key].filter(function (v, index, arr) {
            return value != v
        });

        if (this.data[key].length == 0) {
            delete this.data[key]
            return true;
        }
    }
    return false
}