import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import BookIcon from "@material-ui/icons/Book";
import {
  useBookTripsMutation,
  useGetLaunchDetailsQuery,
  useCancelTripMutation
} from "../generated/graphql";
import LaunchDetailsCheck from "../components/LaunchDetailsCheck";
import useDetailStyles from "../styles/detail-styles";
import Feedback from "../components/Feedback";
import replacementImg from "../assets/images/badge-2.png";

const LaunchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [message, setMessage] = useState("");
  const classes = useDetailStyles(booked);

  const { data, loading, error } = useGetLaunchDetailsQuery({
    variables: { id }
  });

  const [bookTrips, { loading: bookLoading }] = useBookTripsMutation();
  const [cancelTrip, { loading: cancelLoading }] = useCancelTripMutation();

  const mutationLoading = bookLoading || cancelLoading;

  useEffect(() => {
    data && setBooked(data.launch.isBooked);
  }, [data]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleBookTrips = async () => {
    try {
      const { data } = await bookTrips({ variables: { launchIds: [id!] } });
      data && setBooked(data.bookTrips.success);
      setCancelled(!data?.bookTrips.success);
      setMessage(`${data?.bookTrips.message}`);
      handleOpen();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancelTrip = async () => {
    try {
      const { data } = await cancelTrip({ variables: { launchId: id! } });
      data && setCancelled(data.cancelTrip.success);
      setBooked(!data?.cancelTrip.success);
      setMessage(`${data?.cancelTrip.message}`);
      handleOpen();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container component="section" maxWidth="md">
      <Box component="section" mt={11}>
        <LaunchDetailsCheck loading={loading} error={error} />
        {data && (
          <>
            <img
              src={data.launch.mission.missionPatch || replacementImg}
              alt={data.launch.mission.name}
              className={classes.img}
            />
            <Typography variant="h4" component="h1">
              {data?.launch.mission.name}
            </Typography>
            <Typography variant="subtitle1">
              <span role="img" aria-label="rocket emoji">
                🚀
              </span>{" "}
              {data?.launch.rocket.name}({data?.launch.rocket.type})
            </Typography>
            <div className={classes.buttonWrapper}>
              <Button
                variant="contained"
                color={booked ? undefined : "primary"}
                endIcon={!booked ? <BookIcon /> : undefined}
                className={classes.button}
                onClick={booked ? handleCancelTrip : handleBookTrips}
                disabled={mutationLoading}
                disableElevation={mutationLoading}
              >
                {mutationLoading ? (
                  <CircularProgress size={25} />
                ) : booked ? (
                  "Cancel Trip"
                ) : (
                  "Book Trip"
                )}
              </Button>
            </div>
          </>
        )}
      </Box>
      <Feedback
        severity={booked || cancelled ? "success" : "error"}
        message={message}
        open={open}
        handleClose={handleClose}
      />
    </Container>
  );
};

export default LaunchDetails;
