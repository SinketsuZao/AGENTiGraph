import { keyframes } from "@emotion/react";
import { styled } from "@mui/system";
import IconButton from "@mui/material/IconButton";

const rotateForward = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-180deg);
  }
`;

const rotateBackward = keyframes`
  from {
    transform: rotate(-180deg);
  }
  to {
    transform: rotate(0deg);
  }
`;
export default styled(IconButton)(({ rotate }) => ({
  animation: `${rotate ? rotateForward : rotateBackward} 0.5s ease-in-out`,
  transform: rotate ? "rotate(-180deg)" : "rotate(0deg)",
}));
