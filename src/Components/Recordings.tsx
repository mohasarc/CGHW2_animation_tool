import {
    Grid,
    Card,
    CardContent,
    CardHeader,
    ListItemText,
    ListItemButton,
    ListItem,
    List,
    Box,
    IconButton,
    ButtonGroup
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';

import { StateManager } from '../util/StateManager';

export interface Shape {
    vertexData: number[], // Vec2
    colorData: number[], // Vec4
    brushSize: number[],
    boundingRectData: number[], // Vec4
    type: 'point' | 'triangle' | 'nofill-triangle' | 'rectangle' | 'nofill-rectangle' | 'elipse' | 'nofill-elipse',
    center?: number[], // for elipse only
    size?: { w: number, h: number }, // for elipse only
}

export interface Recording {
    name: string,
    z_index: number,
    visible: boolean,
    id: string,
    shapes: Shape[],
}

let count = 1;

export function Recordings() {
    const [recordings, setRecordings] = useState(StateManager.getInstance().getState('recordings'));
    const [selectedRecording, setSelectedRecording] = useState(StateManager.getInstance().getState('SelectedRecording'));

    StateManager.getInstance().subscribe('recordings', () => {
        setRecordings(StateManager.getInstance().getState('recordings'));
    });

    StateManager.getInstance().subscribe('SelectedRecording', () => {
        setSelectedRecording(StateManager.getInstance().getState('SelectedRecording'))
    })

    function addRecording() {
        const newRecording = {
            name: `New Recording (${count + 1})`,
            z_index: recordings.length,
            visible: true,
            id: `${count++}`,
            shapes: [],
            vertexData: [],
            colorData: [],
            brushSizeData: [],
            boundingRectData: [], // The rectangle enclosing the pixels of a particular shape
        };

        StateManager.getInstance().setState('recordings', [{ ...newRecording }, ...recordings]);
        StateManager.getInstance().setState('SelectedRecording', newRecording.id);
    }

    function toggleVisibility(recordingId: string) {
        const changingRecording = recordings.find((recording: Recording) => recording.id === recordingId);
        changingRecording.visible = !changingRecording.visible;
        const newRecordings = recordings.map((recording: Recording) => {
            if (recording.id == changingRecording.id)
                return changingRecording;
            else
                return recording;
        });

        StateManager.getInstance().setState('recordings', [...newRecordings]);
    }

    function selectRecording(recordingId: string) {
        StateManager.getInstance().setState('SelectedRecording', recordingId);
    }

    function removeRecording(recordingId: string) {
        const newRecordings = recordings.filter((recording: Recording) => recording.id !== recordingId);
        const selectedRecordingId = StateManager.getInstance().getState('SelectedRecording');
        StateManager.getInstance().setState('recordings', [...newRecordings]);

        if (selectedRecordingId === recordingId) {
            StateManager.getInstance().setState('SelectedRecording', newRecordings[0] ? newRecordings[0].id : '');
        }
    }

    function moveRecordingUp(recordingId: string) {
        const newRecordings = [...recordings];

        let movingRecordingIndex: number = -1;
        for (let i = 0; i < recordings.length; i++) {
            if (recordings[i].id === recordingId)
                movingRecordingIndex = i;
        }

        if (movingRecordingIndex > 0 && movingRecordingIndex < recordings.length) {
            newRecordings[movingRecordingIndex] = recordings[movingRecordingIndex - 1];
            newRecordings[movingRecordingIndex - 1] = recordings[movingRecordingIndex];
        }

        StateManager.getInstance().setState('recordings', [...newRecordings]);
    }

    function moveRecordingDown(recordingId: string) {
        const newRecordings = [...recordings];

        let movingRecordingIndex: number = -1;
        for (let i = 0; i < recordings.length; i++) {
            if (recordings[i].id === recordingId)
                movingRecordingIndex = i;
        }

        if (movingRecordingIndex >= 0 && movingRecordingIndex < recordings.length - 1) {
            newRecordings[movingRecordingIndex] = recordings[movingRecordingIndex + 1];
            newRecordings[movingRecordingIndex + 1] = recordings[movingRecordingIndex];
        }

        StateManager.getInstance().setState('recordings', [...newRecordings]);
    }

    return (
        <Card>
            <CardHeader title={'Recordings'} titleTypographyProps={{ variant: 'body2', align: 'center', color: 'common.white' }} style={{ backgroundColor: '#323638' }} />
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                <Box
                    sx={{ width: '100%', height: 142 }}
                >
                    <List
                        sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: 'background.dark',
                            position: 'relative',
                            overflow: 'auto',
                            '& ul': { padding: 0 },
                        }}
                        style={{ backgroundColor: '#3b4245' }}
                    >
                        <ListItem >
                            <ListItemButton style={{ width: '100%' }} onClick={addRecording}>
                                <AddIcon style={{ width: '100%' }} sx={{ color: 'white' }} />
                            </ListItemButton>
                        </ListItem>
                        {recordings.map((item: Recording) => (
                            <ListItem style={{ backgroundColor: item.id === selectedRecording ? '#1e2224' : '' }}>
                                <Grid container rowSpacing={1} columns={{ xs: 12, sm: 12, md: 12 }} >
                                    <Grid item xs={2} sm={2} md={2}>
                                        <Box>
                                            <IconButton id={item.id} onClick={(e) => { toggleVisibility(e.currentTarget.id) }}>
                                                {
                                                    item.visible
                                                        ? <VisibilityIcon sx={{ color: 'white' }} />
                                                        : <VisibilityOffIcon sx={{ color: 'white' }} />
                                                }
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4} sm={4} md={4}>
                                        <Box>
                                            <ListItemButton id={item.id} onClick={(e) => { selectRecording(e.currentTarget.id) }}>
                                                <ListItemText primary={item.name} primaryTypographyProps={{ variant: 'body2', align: 'left', color: 'common.white' }} />
                                            </ListItemButton>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6}>
                                        <ButtonGroup>
                                            <IconButton id={item.id} onClick={(e) => { moveRecordingUp(e.currentTarget.id) }}>
                                                <ArrowDropUpIcon sx={{ color: 'white' }} />
                                            </IconButton>
                                            <IconButton id={item.id} onClick={(e) => { moveRecordingDown(e.currentTarget.id) }}>
                                                <ArrowDropDownIcon sx={{ color: 'white' }} />
                                            </IconButton>
                                            <IconButton id={item.id} onClick={(e) => { removeRecording(e.currentTarget.id) }}>
                                                <ClearIcon sx={{ color: 'white' }} />
                                            </IconButton>
                                        </ButtonGroup>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
}
