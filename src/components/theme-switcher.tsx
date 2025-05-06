import { useCustomTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PaletteIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { themes, setTheme } = useCustomTheme();
  const { setTheme: setNextTheme } = useTheme();

  // Handler for setting both themes at once
  const handleThemeChange = (themeName: string) => {
    // Set our custom theme
    setTheme(themeName);
    // Also set the next-themes theme for dark/light mode
    if (themeName === "dark" || themeName === "light" || themeName === "system") {
      setNextTheme(themeName);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <PaletteIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* System preference option */}
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
        
        {/* Light/Dark options */}
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        
        {/* Custom themes */}
        {themes.filter(t => !["light", "dark", "system"].includes(t.name)).map(theme => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => handleThemeChange(theme.name)}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: theme.brandPrimary }} 
              />
              {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 