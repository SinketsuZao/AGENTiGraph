import React, { useState } from "react";
import { Box, Typography } from "@material-ui/core";
import Visualization from "./Visualization";
import ContentPanel from "./ContentPanel";
import "./index.css";
import { TEST_DATA } from "./data/testData";
import { UNION_ANNOTATION_DATA } from "./data/livescore";
import { UNION_ANNOTATION_TEXT } from "./data/unionAnnotationText";
import { generateSelectedDataset, generateMentionedDataset } from "./utils";
import { makeStyles } from "@material-ui/core/styles";
import StartIcon from "@mui/icons-material/Start";
import AnimatedBox from "./components/AnimatedBox";
import SearchIcon from "@mui/icons-material/Search";
import RotateIconButton from "./components/RotateIconButton";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const useStyles = makeStyles((theme) => ({
  // sliderWrapper: {
  //   width: "400px",
  // },
  slideBar: {
    backgroundColor: "rgba(248, 248, 247, 0.5)",
  },
  iconButton: {
    fontSize: "14px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#e8e8e3",
    },
    padding: "5px 12px",
    borderRadius: "4px",
    marginY: "10px",
  },
}));

const App = () => {
  const classes = useStyles();

  const DATA_SOURCE = UNION_ANNOTATION_DATA;

  const [selectedId, setSelectedId] = useState();

  const [visData, setVisData] = useState(UNION_ANNOTATION_DATA);
  const [isOverview, setIsOverview] = useState(true);
  const [scoreValue, setScoreValue] = useState(0);

  const [sideBarExtend, setSideBarExtend] = useState(false);

  const [mentionedNodes, setMentionedNodes] = useState([]);

  const handleSelectTopic = (selectedId) => {
    setSelectedId(selectedId);
    setVisData(generateSelectedDataset(selectedId, DATA_SOURCE));
    setIsOverview(!selectedId);
  };

  const handleClickOverview = () => {
    setSelectedId(null);
    setVisData(DATA_SOURCE);
    setIsOverview(true);
  };

  const handleMentionNode = (nodes) => {
    if (nodes.length === 0) {
      setMentionedNodes(nodes);
      setVisData(DATA_SOURCE);
      return;
    }
    setMentionedNodes(nodes);
    setVisData(generateMentionedDataset(nodes, DATA_SOURCE));
    setIsOverview(false);
  };

  const valuetext = (value) => {
    setScoreValue(value);
  };

  return (
    <section className="App">
      <header className="App-header">
        <Typography variant="h5">Prerequisite Visualization</Typography>
      </header>
      <Box
        className="Content"
        display="flex"
        flexDirection="row"
        justifyContent="center"
      >
        {/* 侧边栏 */}
        <AnimatedBox
          sideBarExtend={sideBarExtend}
          width={sideBarExtend ? 150 : 90}
          className={classes.slideBar}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          paddingY={5}
        >
          <Box display="flex" flexDirection="column" alignItems="start">
            <Box
              display="flex"
              flexDirection="row"
              className={classes.iconButton}
            >
              <SearchIcon />
              {sideBarExtend ? <Typography>Home</Typography> : null}
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              className={classes.iconButton}
              marginY={1}
            >
              <ExitToAppIcon />
              {sideBarExtend ? <Typography>Sign out</Typography> : null}
            </Box>
          </Box>
          <Box>
            <RotateIconButton
              sx={{ background: "rgb(232, 232, 227)" }}
              onClick={() => setSideBarExtend(!sideBarExtend)}
              rotate={sideBarExtend}
            >
              <StartIcon />
            </RotateIconButton>
          </Box>
        </AnimatedBox>
        {/* <div className={classes.sliderWrapper}>
            <Slider
              defaultValue={0.1}
              getAriaValueText={valuetext}
              valueLabelDisplay="on"
              step={0.1}
              marks
              min={0}
              max={1}
              color="secondary"
            />
          </div> */}
        {/* <Box flex={5} display="flex" flexDirection="row" justifyContent="center"> */}
        <Visualization
          data={visData}
          isOverview={isOverview}
          handleSelectTopic={handleSelectTopic}
          selectedId={selectedId}
        />

        <ContentPanel
          data={DATA_SOURCE}
          selectedId={selectedId}
          handleClickOverview={handleClickOverview}
          handleSelectTopic={handleSelectTopic}
          isOverview={isOverview}
          selectedNode={visData.nodes}
          selectedContent={UNION_ANNOTATION_TEXT.find(
            (el) => el.id === selectedId,
          )}
          handleMentionNode={handleMentionNode}
          setSelectedId={setSelectedId}
        />
      </Box>

      {/* </Box> */}
    </section>
  );
};

export default App;
