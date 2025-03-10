import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navigation from './navigation';
import HeartButton from './heart';
import useUserStore from '../zuStore';

const Details = () => {
  const details = useSelector((state) => state.user.details);
  console.log('details: ', details);
  const [bidState, setBidState] = useState('');
  const [reviewState, setReviewState] = useState('');
  const { zuUsername } = useUserStore();

  const [getReviewAndBid, setgetReviewAndBid] = useState([]);
  const [getBidState, setGetBidState] = useState('');
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  console.log('here is the username from details: ', zuUsername);
  useEffect(() => {
    let isMounted = true;
    fetch(`http://localhost:3000/getReviewAndBid/${details[0].name}`)
      .then((data) => data.json())
      .then((data) => {
        if (isMounted) {
          setgetReviewAndBid(data.review);
          setGetBidState(data.bid);
          setReviewsLoaded(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function submitBid(e) {
    e.preventDefault();
    fetch('http://localhost:3000/placeBid', {
      method: 'POST',
      body: JSON.stringify({
        amount: bidState,
        itemName: details[0].name,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.success) {
          setGetBidState(bidState);
          setBidState('');
          alert(data.message);
        } else {
          alert(data.message);
          setBidState('');
        }
      })
      .catch((err) => {
        console.error('Fetching users failed: ', err);
      });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bid') {
      setBidState(value);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    if (name === 'review') {
      setReviewState(value);
    }
  };

  const handleReviewButton = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/addReview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemName: details[0].name,
        message: reviewState,
      }),
    });
    setgetReviewAndBid((prevReviews) => [...prevReviews, reviewState]);
    setReviewState('');
  };

  const body = {
    username: zuUsername,
    details: details[0],
  };

  const handleBuyButton = async () => {
    try {
      const response = await fetch('http://localhost:3000/buyItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setGetBidState('Bidding has ended!');
        setBidState('');
        alert(data.message);
      } else {
        alert(data.message);
        setBidState('');
      }
    } catch (err) {
      console.error('Fetching bought items failed: ', err);
    }
  };

  return (
    <>
      <Navigation />
      <div className='details'>
        {details.map((item, index) => (
          <div className='detailsbox' key={index}>
            <img className='picturesize' src={item.picture} alt='loading pic' />
            <div className='detailsDiv'>
              <br />
              <div>Name : {item.name}</div>
              <div>Date posted: {item.date}</div>
              <div>Description: {item.description} </div>
              <div>City: {item.city} </div>
              <div id='buy-it-now'>
                <div>Price: {item.price} </div>
                <button type='button' onClick={handleBuyButton}>
                  {' '}
                  Buy Now!{' '}
                </button>
              </div>
              <div>Current Bid : {getBidState}</div>
              <form onSubmit={submitBid}>
                <input
                  name='bid'
                  type='text'
                  value={bidState}
                  placeholder='Make your bid!'
                  onChange={handleInputChange}
                ></input>
                <button type='submit'>Submit Bid</button>
              </form>
            </div>
          </div>
        ))}
        <div className='detailsbox'>
          <div className='reviewbox'>
            <div id='reviews'>Add a review</div>
            <form onSubmit={handleReviewButton}>
              <input
                name='review'
                type='text'
                placeholder='Write A Review'
                onChange={handleReviewChange}
                value={reviewState}
              ></input>
              <button type='submit'>Submit Review</button>
              <div className='review-comment-container'>
                {reviewsLoaded &&
                  getReviewAndBid.map((review, index) => {
                    return (
                      <div id='review-comment' key={index}>
                        "{review}"
                      </div>
                    );
                  })}
              </div>
            </form>
          </div>
          <HeartButton user={zuUsername} />
        </div>
      </div>
    </>
  );
};

export default Details;
