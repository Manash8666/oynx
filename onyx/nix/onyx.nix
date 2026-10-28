{
  lib,
  stdenvNoCC,
  callPackage,
  bun,
  bubblewrap,
  nodejs,
  sysctl,
  makeBinaryWrapper,
  models-dev,
  ripgrep,
  installShellFiles,
  versionCheckHook,
  writableTmpDirAsHomeHook,
  node_modules ? callPackage ./node-modules.nix { },
}:
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "onyx";
  inherit (node_modules) version src;
  inherit node_modules;

  nativeBuildInputs = [
    bun
    nodejs # for patchShebangs node_modules
    installShellFiles
    makeBinaryWrapper
    models-dev
    writableTmpDirAsHomeHook
  ];

  configurePhase = ''
    runHook preConfigure

    cp -R ${finalAttrs.node_modules}/. .
    patchShebangs node_modules
    patchShebangs packages/*/node_modules

    runHook postConfigure
  '';

  env.MODELS_DEV_API_JSON = "${models-dev}/dist/_api.json";
  env.ONYX_DISABLE_MODELS_FETCH = true;
  env.ONYX_SKIP_BUNDLED_BWRAP = "1";
  env.ONYX_VERSION = finalAttrs.version;
  env.ONYX_CHANNEL = "local";

  buildPhase = ''
    runHook preBuild

    cd ./packages/opencode
    bun --bun ./script/build.ts --single --skip-install
    bun --bun ./script/schema.ts schema.json

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    install -Dm755 dist/@kilocode/cli-*/bin/kilo $out/bin/onyx
    install -Dm644 schema.json $out/share/onyx/schema.json

    wrapProgram $out/bin/onyx \
      ${lib.optionalString stdenvNoCC.hostPlatform.isLinux "--set ONYX_BWRAP_PATH ${bubblewrap}/bin/bwrap"} \
      --prefix PATH : ${
        lib.makeBinPath (
          [
            ripgrep
          ]
          # bun runs sysctl to detect if running on rosetta2
          ++ lib.optional stdenvNoCC.hostPlatform.isDarwin sysctl
        )
      }

    runHook postInstall
  '';

  postInstall = lib.optionalString (stdenvNoCC.buildPlatform.canExecute stdenvNoCC.hostPlatform) ''
    # trick yargs into also generating zsh completions
    installShellCompletion --cmd onyx \
      --bash <($out/bin/onyx completion) \
      --zsh <(SHELL=/bin/zsh $out/bin/onyx completion)
  '';

  nativeInstallCheckInputs = [
    versionCheckHook
    writableTmpDirAsHomeHook
  ];
  doInstallCheck = true;
  versionCheckKeepEnvironment = [
    "HOME"
    "ONYX_DISABLE_MODELS_FETCH"
  ];
  versionCheckProgramArg = "--version";

  passthru = {
    jsonschema = "${placeholder "out"}/share/onyx/schema.json";
  };

  meta = {
    description = "Onyx — High-Performance Commercial AI IDE";
    homepage = "https://onyx.dev/";
    license = [ lib.licenses.mit ];
    mainProgram = "onyx";
    inherit (node_modules.meta) platforms;
  };
})
