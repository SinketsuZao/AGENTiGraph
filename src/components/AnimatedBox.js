import { keyframes } from "@emotion/react";
import { styled } from "@mui/system";
import { Box } from "@material-ui/core";

const expand = keyframes`
from {
  width: 90px;
}
to {
  width: 220px;
}
`;

const collapse = keyframes`
from {
  width: 220px;
}
to {
  width: 90px;
}
`;

export default styled(Box)(({ theme, sideBarExtend }) => ({
  animation: `${sideBarExtend ? expand : collapse} 0.3s ease-in-out`,
  width: sideBarExtend ? 220 : 90,
}));
