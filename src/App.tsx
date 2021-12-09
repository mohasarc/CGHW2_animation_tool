import "./styles.css";
import { Container, Grid, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio} from "@mui/material";
import { StateManager } from "./util/StateManager";
import { Recordings } from "./Components/Recordings";
import MotionControls from "./Components/MotionControls";
import BodyOptionControls from "./Components/BodyOptionControls";
import ToolBar from "./Components/ToolBar";
import AnimArea from "./Components/AnimArea";


export default function App() {
    // Initial value
    StateManager.getInstance().setState('slider-1', 20);
    StateManager.getInstance().setState('slider-2', 20);
    StateManager.getInstance().setState('slider-3', 20);
    StateManager.getInstance().setState('slider-4', 20);

    StateManager.getInstance().setState('timeline', [[{
        name: `New Recording (${1})`,
        z_index: 0,
        visible: true,
        id: `${0}`,
        shapes: [],
    }]]);
    StateManager.getInstance().setState('cur-timeline-node', 0);
    StateManager.getInstance().setState('cropping-layer', {
        name: `CropRecording`,
        z_index: 0,
        visible: true,
        id: `${0}`,
        shapes: [],
    });
    StateManager.getInstance().setState('recordings', [{
        name: `New Recording (${1})`,
        z_index: 0,
        visible: true,
        id: `${0}`,
        shapes: [],
    }]);
    StateManager.getInstance().setState('selectedRecording', '0');

    return (
        <div className="App">
            <Container>
                <Grid container rowSpacing={1} columns={{ xs: 12, sm: 12, md: 12 }} >
                    <Grid item xs={12} sm={12} md={12}>
                        <Box mt={1} mb={2}>
                            <ToolBar></ToolBar>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={12} md={12}>
                        <Grid container rowSpacing={1} columns={{ xs: 12, sm: 12, md: 12 }} columnSpacing={{ xs: 1, sm: 2, md: 3}}>
                            <Grid item xs={12} sm={6} md={2}>
                                <MotionControls />
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={6} >
                                <AnimArea />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <BodyOptionControls />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Box py={0}>
                                    <Recordings />
                                </Box>
                            </Grid>
                            
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}
