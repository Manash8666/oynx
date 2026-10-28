export interface TechStackDefinition {
  readonly id: string
  readonly name: string
  readonly category: "BACKEND" | "FRONTEND" | "SYSTEMS" | "MOBILE" | "DATA_DATABASE"
  readonly primaryLanguages: readonly string[]
  readonly fileExtensions: readonly string[]
  readonly packageManagers: readonly string[]
  readonly popularFrameworks: readonly string[]
  readonly defaultLspServer: string
  readonly buildCommand: string
  readonly testCommand: string
  readonly hasTreeSitterSupport: boolean
  readonly commercialReadiness: "PRODUCTION_READY" | "BETA"
}

export const TRADITIONAL_TECH_STACKS: readonly TechStackDefinition[] = [
  // 1. Java / JVM Stack
  {
    id: "java-spring",
    name: "Java Enterprise (Spring Boot / Jakarta)",
    category: "BACKEND",
    primaryLanguages: ["Java", "Kotlin"],
    fileExtensions: [".java", ".kt", ".gradle", ".xml"],
    packageManagers: ["maven", "gradle"],
    popularFrameworks: ["Spring Boot", "Quarkus", "Micronaut", "Hibernate"],
    defaultLspServer: "jdtls",
    buildCommand: "mvn clean compile",
    testCommand: "mvn test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 2. Python Stack
  {
    id: "python-backend",
    name: "Python (FastAPI / Django / Flask)",
    category: "BACKEND",
    primaryLanguages: ["Python"],
    fileExtensions: [".py", ".pyi", ".toml"],
    packageManagers: ["uv", "poetry", "pip", "conda"],
    popularFrameworks: ["FastAPI", "Django", "Flask", "SQLAlchemy", "Pydantic"],
    defaultLspServer: "pyright",
    buildCommand: "python -m py_compile",
    testCommand: "pytest",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 3. C# / .NET Stack
  {
    id: "dotnet-csharp",
    name: "C# / .NET Enterprise",
    category: "BACKEND",
    primaryLanguages: ["C#", "F#"],
    fileExtensions: [".cs", ".csproj", ".sln"],
    packageManagers: ["nuget", "dotnet cli"],
    popularFrameworks: ["ASP.NET Core", "Entity Framework Core", "Blazor", "MAUI"],
    defaultLspServer: "OmniSharp",
    buildCommand: "dotnet build",
    testCommand: "dotnet test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 4. Node.js / TypeScript Stack
  {
    id: "node-typescript",
    name: "Node.js / TypeScript / React / Next.js",
    category: "FRONTEND",
    primaryLanguages: ["TypeScript", "JavaScript"],
    fileExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    packageManagers: ["bun", "pnpm", "npm", "yarn"],
    popularFrameworks: ["React", "Next.js", "Vue", "Angular", "Express", "NestJS"],
    defaultLspServer: "typescript-language-server",
    buildCommand: "bun run build",
    testCommand: "bun test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 5. Go Stack
  {
    id: "golang-microservices",
    name: "Go (Golang Microservices)",
    category: "BACKEND",
    primaryLanguages: ["Go"],
    fileExtensions: [".go", ".mod"],
    packageManagers: ["go modules"],
    popularFrameworks: ["Gin", "Echo", "Fiber", "Chi", "gRPC"],
    defaultLspServer: "gopls",
    buildCommand: "go build ./...",
    testCommand: "go test ./...",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 6. C / C++ Systems Stack
  {
    id: "cpp-systems",
    name: "C / C++ Native Systems",
    category: "SYSTEMS",
    primaryLanguages: ["C", "C++"],
    fileExtensions: [".c", ".cpp", ".cc", ".h", ".hpp", ".cmake"],
    packageManagers: ["conan", "vcpkg", "cmake"],
    popularFrameworks: ["Qt", "Boost", "Unreal Engine", "POSIX APIs"],
    defaultLspServer: "clangd",
    buildCommand: "cmake --build build",
    testCommand: "ctest",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 7. Rust Systems Stack
  {
    id: "rust-systems",
    name: "Rust High-Performance Systems",
    category: "SYSTEMS",
    primaryLanguages: ["Rust"],
    fileExtensions: [".rs", ".toml"],
    packageManagers: ["cargo"],
    popularFrameworks: ["Tokio", "Actix-web", "Axum", "Tauri"],
    defaultLspServer: "rust-analyzer",
    buildCommand: "cargo check",
    testCommand: "cargo test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 8. PHP / Laravel Stack
  {
    id: "php-laravel",
    name: "PHP (Laravel / Symfony)",
    category: "BACKEND",
    primaryLanguages: ["PHP"],
    fileExtensions: [".php"],
    packageManagers: ["composer"],
    popularFrameworks: ["Laravel", "Symfony", "WordPress"],
    defaultLspServer: "intelephense",
    buildCommand: "composer install",
    testCommand: "php artisan test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 9. Ruby / Rails Stack
  {
    id: "ruby-rails",
    name: "Ruby on Rails",
    category: "BACKEND",
    primaryLanguages: ["Ruby"],
    fileExtensions: [".rb", ".erb", ".gemfile"],
    packageManagers: ["bundler", "rubygems"],
    popularFrameworks: ["Ruby on Rails", "Sinatra"],
    defaultLspServer: "solargraph",
    buildCommand: "bundle install",
    testCommand: "bundle exec rspec",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 10. SQL / Relational Databases
  {
    id: "sql-relational",
    name: "SQL Databases (Postgres / MySQL / SQLite)",
    category: "DATA_DATABASE",
    primaryLanguages: ["SQL"],
    fileExtensions: [".sql", ".psql"],
    packageManagers: ["dbmate", "prisma", "flyway", "liquibase"],
    popularFrameworks: ["PostgreSQL", "MySQL", "SQLite", "MSSQL", "Oracle"],
    defaultLspServer: "sqls",
    buildCommand: "sqlfluff lint",
    testCommand: "pg_prove",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },
] as const

export class TraditionalTechStackRegistry {
  public static getAllStacks(): readonly TechStackDefinition[] {
    return TRADITIONAL_TECH_STACKS
  }

  public static getByExtension(ext: string): TechStackDefinition | undefined {
    const formatted = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    return TRADITIONAL_TECH_STACKS.find((stack) =>
      stack.fileExtensions.some((e) => e.toLowerCase() === formatted)
    )
  }

  public static getById(id: string): TechStackDefinition | undefined {
    return TRADITIONAL_TECH_STACKS.find((s) => s.id === id)
  }

  public static getByCategory(category: TechStackDefinition["category"]): TechStackDefinition[] {
    return TRADITIONAL_TECH_STACKS.filter((s) => s.category === category)
  }
}
