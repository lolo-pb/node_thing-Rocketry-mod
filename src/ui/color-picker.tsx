import React from "react";
import {
  ColorPicker,
  ColorArea,
  ColorThumb,
  ColorSwatch,
  ColorSlider,
  SliderTrack,
  ColorField,
  Color,
  ColorFieldRenderProps,
  DialogTrigger,
  Dialog,
  Popover,
  Button,
  parseColor,
} from "react-aria-components";
import cn from "classnames";

import { Input } from "@/ui/input";

type ColorInputProps = {
  color?: number[];
  onChange?: (color: number[]) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "color">;

export const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ color = [0, 0, 1, 1], onChange, className, ...props }, forwardedRef) => {
    const [r, g, b] = color.map((val) => Math.round(val * 255));

    const handleChange = (c: Color) => {
      const rgba = c.toFormat("rgba");
      const rgb = rgba
        .getColorChannels()
        .map((ch) => rgba.getChannelValue(ch) / 255);
      onChange?.(rgb);
    };

    return (
      <div
        ref={forwardedRef}
        className={cn("flex gap-2 items-center", className)}
        {...props}
      >
        <ColorPicker
          value={parseColor(`rgb(${r}, ${g}, ${b})`)}
          onChange={handleChange}
        >
          <DialogTrigger>
            <Button className="w-full cursor-pointer rounded-lg overflow-hidden">
              <ColorSwatch className="w-full h-5" />
            </Button>
            <Popover
              className={cn(
                "transform transition-transform duration-200 ease-out",
                "data-[entering]:opacity-0 data-[entering]:scale-90",
                "data-[exiting]:opacity-0 data-[exiting]:scale-90",
              )}
            >
              <Dialog className="flex flex-col gap-4 p-4 min-w-48 box-border rounded-xl glass glass-border focus-visible:outline-none">
                <ColorArea
                  className="w-48 h-48 rounded-md flex-shrink-0 relative"
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                >
                  <ColorThumb className="w-5 h-5 rounded-full border-2 border-white shadow-[0_0_0_1px_black,inset_0_0_0_1px_black] box-border absolute" />
                </ColorArea>

                <ColorSlider
                  colorSpace="hsb"
                  channel="hue"
                  className="grid w-full gap-1"
                >
                  <SliderTrack className="relative rounded-md h-6">
                    <ColorThumb className="top-1/2 w-5 h-5 rounded-full border-2 border-white shadow-[0_0_0_1px_black,inset_0_0_0_1px_black] box-border" />
                  </SliderTrack>
                </ColorSlider>

                <ColorField aria-label="picker">
                  {(
                    props: ColorFieldRenderProps & {
                      defaultChildren?: React.ReactNode;
                    },
                  ) => {
                    const {
                      isDisabled,
                      isInvalid,
                      defaultChildren,
                      ...inputProps
                    } = props;
                    void isInvalid;
                    void defaultChildren;
                    const commitChange = () => {
                      inputProps.state.commit();
                    };

                    return (
                      <Input
                        {...inputProps}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onChange={(ev) => {
                          inputProps.state.setInputValue(
                            ev.currentTarget.value,
                          );
                        }}
                        onBlur={commitChange}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") commitChange();
                        }}
                        value={inputProps.state.inputValue}
                        disabled={isDisabled}
                      />
                    );
                  }}
                </ColorField>
              </Dialog>
            </Popover>
          </DialogTrigger>
        </ColorPicker>
      </div>
    );
  },
);
ColorInput.displayName = "ColorInput";
