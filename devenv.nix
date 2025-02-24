{ pkgs, lib, config, inputs, ... }:

{
  env.GREET = "retro-board";
  packages = [ pkgs.git ];
  languages.typescript.enable = true;

  processes = {
    retro-board-frontend = {
      exec = ''
        cd frontend && npm run dev
      '';
    };
    retro-board-backend = {
      exec = ''
        cd backend && npm run start:dev
      '';
    };
  };
}
