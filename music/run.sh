SOX=sox/sox
WAVS=fl_studio
# Trip hi-hat
echo 1
$SOX "$WAVS/Game_Hi Hat.wav" "move.wav" trim 0.24 0.46
# Add input files for drum channels together
echo 2
$SOX -m $WAVS/Game_Kick.wav $WAVS/Game_Snare.wav background.wav trim 0 1.90
#$SOX tmp.wav background.wav 0.24 0.70
echo 3
$SOX $WAVS/Game_keys.wav jump%1n.wav trim 8.0 1.130 : newfile : trim 0 1 : newfile : trim 0 1 : newfile : trim 0 1
echo 4
$SOX $WAVS/Game_bass.wav trigger.wav trim 16.0 3.96
