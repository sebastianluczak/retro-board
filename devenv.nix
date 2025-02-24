{ pkgs, lib, config, inputs, ... }:

{
  env.GREET = "retro-board";
  packages = [ pkgs.git ];
  languages.typescript.enable = true;

  # Processes for `devenv up` command to build & run application
  processes = {
    retro-board-frontend = {
      exec = ''
        cd frontend && npm ci && npm run dev
      '';
    };
    retro-board-backend = {
      exec = ''
        cd backend && npm ci && npm run start:dev
      '';
    };
  };
}
