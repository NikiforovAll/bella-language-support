PROJECT_BASE_PATH='..\src\Domain'

EXT_WS='ExtWS.cs'
OUTPUT_BUNDLE='../docs/meta/ext-ws-bundle'
mkdir -p $OUTPUT_BUNDLE

echo 'Runninig ImportExtWS.sh from folder:'
pwd
echo 'Created bundle:'
echo $OUTPUT_BUNDLE

printf '\n'

find "$PROJECT_BASE_PATH" -type f -iname "$EXT_WS" -print0 | while IFS= read -r -d $'\0' line; do
    CURRENT_COMPONENT=`echo $line | cut -d '/' -f3`
    cp $line "$OUTPUT_BUNDLE/$CURRENT_COMPONENT.$EXT_WS"
done