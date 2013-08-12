SOX=sox/sox
WAVS=fl_studio
pushd `dirname $0` >& /dev/null
echo 1
$SOX "$WAVS/Game_Hi Hat.wav" "move.wav" trim 16.24 0.46
# Add input files for drum channels together
echo 2
#$SOX -m tmp.wav
$SOX -m $WAVS/Game_Kick.wav $WAVS/Game_Snare.wav $WAVS/Game_Ride.wav background.wav trim 8 1.90 gain 6

echo 3
$SOX $WAVS/Game_keys.wav jump1.wav trim 16.0 2.13
$SOX $WAVS/Game_keys.wav jump2.wav trim 17 2
$SOX $WAVS/Game_keys.wav jump3.wav trim 18 2
$SOX $WAVS/Game_keys.wav jump4.wav trim 19 2
echo 4
$SOX $WAVS/Game_keys.wav trigger1.wav trim 16.0 4.04
$SOX $WAVS/Game_bass.wav trigger2.wav trim 16.0 4.01
$SOX $WAVS/Game_brasshigh.wav trigger3.wav trim 32.0 4.01 gain -2
popd
