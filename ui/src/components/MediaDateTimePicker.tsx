import { DatePicker } from "@mui/x-date-pickers-pro";
import { useState } from "react";
import { dayjsToLocalDateTime, maybeDayjsToLocalDateTime, maybeLocalDateTimeToDayjs, strToLocalDateTime, ZonedDateTime } from "../dateTime";
import { Media } from "../host-ui-bridge/generated-bindings";

export default function MediaDateTimePicker(
    {
        media,
        onPicked
    }: { media: Media, onPicked: (newValue: ZonedDateTime) => void }
) {
    const [value, setValue] = useState<ZonedDateTime | null>(
        media.dateTime == null ? null : strToLocalDateTime(media.dateTime)
    )
    return <DatePicker
        label="Custom input"
        value={maybeLocalDateTimeToDayjs(value)}
        onChange={(newValue) => setValue(maybeDayjsToLocalDateTime(newValue))}
        onAccept={(newValue) => {
            if (newValue == null) return
            onPicked(dayjsToLocalDateTime(newValue))
        }}
        openTo="day"
        views={['year', 'month', 'day']}
        OpenPickerButtonProps={{ sx: { color: 'white' } }}
        renderInput={({ inputRef, inputProps, InputProps }) => (
            // <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <div className="inline-block">
                <input ref={inputRef} {...inputProps} className='invisible w-0' />
                <div className="mr-2">{InputProps?.endAdornment}</div>
            </div>
            // </Box>
        )}
    />
}