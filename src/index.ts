type Newable<T> = new (...args: any[]) => T;

type ServiceAndDependencies<T> = {
  definition: Newable<T>;
  dependencies?: string[];
  singleton?: boolean;
};

interface IContainer {
  register<T>(name: string, definition: Newable<T>, dependencies?: string[]): void;
  singleton<T>(name: string, definition: Newable<T>, dependencies?: string[]): void;
  get: <T>(name: string) => T;
}

interface Services extends Map<string, ServiceAndDependencies<any>> {
  set<T>(name: string, type: ServiceAndDependencies<T>): this;
  get<T>(name: string): T;
}

export default class Container implements IContainer {
  // All services here will not be instantiated until they are retrieved
  private services: Services;

  // If we only want one instance of a service, then we add that instance here so we
  // can retrieve it later
  private singletons: Services;

  public constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  public register<T>(name: string, definition: Newable<T>, dependencies: string[] = []) {
    this.services.set<T>(name, { definition, dependencies });
  }

  public singleton<T>(name: string, definition: Newable<T>, dependencies: string[] = []) {
    this.services.set<T>(name, {
      definition,
      dependencies,
      singleton: true,
    });
  }

  // This method retrieves the service and instantiates it as well as its dependencies. The
  // dependencies will be passed in as an object (ala named parameters). It is also
  // possible to pass in additional dependencies as a second argument.
  public get = <T>(name: string, additionalDeps = {}) => {
    if (this.singletons.has(name)) {
      return this.singletons.get<T>(name);
    }

    const service = this.services.get<T>(name);

    if (!service) {
      throw new Error(
        `Cannot find "${name}" in your services. Are you sure it is registered and spelled correctly?`
      );
    }

    // @ts-ignore - Need to fix this...
    if (service.singleton) {
      const newSingletonInstance = this.createInstance(service, additionalDeps);
      this.singletons.set<T>(name, newSingletonInstance);
      return newSingletonInstance;
    }

    return this.createInstance(service, additionalDeps);
  };

  private getResolvedDependencies(service: any) {
    return service.dependencies
      ? service.dependencies.reduce(
          (deps: any, name: string) => ({
            ...deps,
            [name]: this.get(name),
          }),
          {}
        )
      : {};
  }

  private createInstance(service: any, otherArgs: any) {
    return new service.definition({
      ...this.getResolvedDependencies(service),
      ...otherArgs,
    });
  }
}
