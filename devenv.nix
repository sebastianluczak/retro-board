{ pkgs, lib, config, inputs, ... }:

{
  env.GREET = "retro-board";
  packages = [ pkgs.git ];
  languages.typescript.enable = true;
}
