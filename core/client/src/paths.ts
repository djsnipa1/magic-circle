const safePath = (name: string) => {
  return name.replace(/\s/g, '-').toLowerCase();

  return (
    name
      .replace(/\s/g, '-')
      .replace(/[%()=:.,!#$@"'/\\|?*+&]/g, '')
      // .replace(/^-+|-+$/g, '')
      // .replace(/-+/g, '-')
      .toLowerCase()
  );
};

export default class Paths {
  paths: Record<string, number>;

  constructor() {
    this.paths = {};
  }

  get(base: string, name: string) {
    const path = base ? safePath(`${base}.${name}`) : name;

    if (!this.paths[path]) {
      this.paths[path] = 0;
      return path;
    }

    this.paths[path] += 1;
    return `${path}_${this.paths[path]}`;
  }
}
