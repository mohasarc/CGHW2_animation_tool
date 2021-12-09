import { Card, CardContent, Button } from '@mui/material';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import { StateManager } from '../util/StateManager'

export default function ToolBar() {
    return (
        <Card>
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                {/* <Button onClick={undo}>
                    <UndoOutlinedIcon sx={{ color: 'white' }} />
                </Button>
                <Button onClick={redo}>
                    <RedoOutlinedIcon sx={{ color: 'white' }} />
                </Button> */}
                <Button onClick={downloadObjectAsJson}>
                    <SaveOutlinedIcon sx={{ color: 'white' }} />
                </Button>
                <Button component="label">
                    <FileUploadIcon sx={{ color: 'white' }} />
                    <input
                        type="file"
                        hidden
                        onChange={changeHandler}
                    />
                </Button>
                <Button onClick={playAnimation} >
                    <PlayArrowRoundedIcon sx={{ color: 'white' }} />
                </Button>
                <Button onClick={stopAnimation} >
                    <StopRoundedIcon sx={{ color: 'white' }} />
                </Button>
                <Button onClick={addFrame} >
                    <AddRoundedIcon sx={{ color: 'white' }} />
                </Button>
            </CardContent>
        </Card>
    );
}

function playAnimation() {
    StateManager.getInstance().setState('play', true);
}

function stopAnimation() {
    StateManager.getInstance().setState('play', false);
}

function addFrame() {
    StateManager.getInstance().setState('frame', 1);
}

/**
 * Src = https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
 */
function downloadObjectAsJson() {
    const data = StateManager.getInstance().serialize();
    const exportName = 'Drawing';
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');

    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".msl");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

/**
 * Reads the selected file
 * @param event 
 */
function changeHandler(event: any) {
    const fileReader = new FileReader();

    fileReader.onload = () => {
        if (fileReader.result && typeof fileReader.result === 'string')
            StateManager.getInstance().initWith(fileReader.result);
    }

    fileReader.readAsText(event.target.files[0]);
};

/**
 * 
 */
function undo() {
    const curTimelineNode = StateManager.getInstance().getState('cur-timeline-node');
    const timeLine = StateManager.getInstance().getState('timeline');
    if (curTimelineNode > 0) {
        StateManager.getInstance().setState('recordings', JSON.parse(JSON.stringify(timeLine[curTimelineNode - 1])));
        StateManager.getInstance().setState('cur-timeline-node', curTimelineNode - 1);
    }
}

/**
 * 
 */
function redo() {
    const curTimelineNode = StateManager.getInstance().getState('cur-timeline-node');
    const timeLine = StateManager.getInstance().getState('timeline');
    if (curTimelineNode < timeLine.length - 1) {
        StateManager.getInstance().setState('recordings', JSON.parse(JSON.stringify(timeLine[curTimelineNode + 1])));
        StateManager.getInstance().setState('cur-timeline-node', curTimelineNode + 1);
    }
}